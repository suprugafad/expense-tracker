import { RegisterUserInput } from './dto/register-user.input';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterUserResponse } from './dto/register-user.response';
import { UsersService } from './users.service';
import { LoginUserInput } from './dto/login-user.input';
import { LoginUserResponse } from './dto/login-user.response';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from './refresh-tokens.service';
import { addDays } from 'date-fns';
import { RefreshTokenResponse } from './dto/refresh-token.response';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async registerUser(
    registerUserInput: RegisterUserInput,
  ): Promise<RegisterUserResponse> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerUserInput.password, salt);
    registerUserInput.password = hashedPassword;

    return this.usersService.createUser(registerUserInput);
  }

  async loginUser(loginUserInput: LoginUserInput): Promise<LoginUserResponse> {
    const { email, password } = loginUserInput;

    const user = await this.usersService.getUserByEmail(email);

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(
        `Invalid credentials for user with email ${email}`,
      );
    }

    await this.refreshTokenService.deleteOldestTokensIfLimitExceeded(user.id);

    const accessTokenPayload = { username: user.name, sub: user.id };
    const access_token = this.jwtService.sign(accessTokenPayload);

    const refreshTokenId = uuid();
    const refreshTokenPayload = { ...accessTokenPayload, jti: refreshTokenId };

    const refresh_token = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const refreshTokenExpiresAt = addDays(new Date(), 7);

    const salt = await bcrypt.genSalt();
    const jtiHash = await bcrypt.hash(refreshTokenId, salt);

    await this.refreshTokenService.saveRefreshToken(
      user.id,
      jtiHash,
      refreshTokenExpiresAt,
    );

    return { access_token, refresh_token };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const refreshTokenPayload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    const refreshTokenId = refreshTokenPayload.jti;

    const refreshTokenRecord = await this.refreshTokenService.getTokenByUserId(
      refreshTokenPayload.sub,
    );

    if (!refreshTokenRecord) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const isTokenValid = await bcrypt.compare(
      refreshTokenId,
      refreshTokenRecord.jtiHash,
    );

    if (!isTokenValid || refreshTokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = refreshTokenRecord.user;

    const access_token = this.jwtService.sign({
      username: user.name,
      sub: user.id,
    });

    return { access_token };
  }
}
