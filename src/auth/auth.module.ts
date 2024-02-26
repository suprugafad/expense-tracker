import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { AuthResolver } from './auth.resolver';
import { UsersRepository } from './users.repository';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { RefreshTokenService } from './refresh-tokens.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: async () => ({
        global: true,
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [
    AuthService,
    UsersService,
    UsersRepository,
    UsersResolver,
    AuthResolver,
    JwtStrategy,
    RefreshTokenStrategy,
    RefreshTokenService,
    RefreshTokensRepository,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class AuthModule {}
