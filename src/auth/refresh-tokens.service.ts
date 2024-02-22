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

  async deleteOldestTokensIfLimitExceeded(userId: string): Promise<void> {
    const maxTokensPerUser = parseInt(process.env.MAX_TOKENS_AMOUNT, 10);

    const tokensCount = await this.refreshTokensRepository.count({
      where: { user: { id: userId } },
    });

    const tokensToDelete = tokensCount - maxTokensPerUser;

    if (tokensToDelete > 0) {
      const idsToDelete = await this.refreshTokensRepository.findIdsToDelete(
        userId,
        tokensToDelete,
      );

      await this.refreshTokensRepository.deleteExcessTokensByIds(idsToDelete);
    }
  }
}
