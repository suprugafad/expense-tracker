import { Injectable } from '@nestjs/common';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(private refreshTokensRepository: RefreshTokensRepository) {}

  async saveRefreshToken(
    userId: string,
    jtiHash: string,
    expiresAt: Date,
  ): Promise<void> {
    const refreshToken = this.refreshTokensRepository.create({
      user: { id: userId },
      jtiHash,
      expiresAt,
    });

    await this.refreshTokensRepository.save(refreshToken);
  }

  async getTokenByUserId(userId: string): Promise<RefreshToken> {
    return await this.refreshTokensRepository.findByUserId(userId);
  }
}
