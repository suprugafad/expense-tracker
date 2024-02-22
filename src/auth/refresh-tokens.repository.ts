import { RefreshToken } from './entities/refresh-token.entity';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokensRepository extends Repository<RefreshToken> {
  constructor(private dataSource: DataSource) {
    super(RefreshToken, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<RefreshToken | undefined> {
    return await this.findOne({
      where: { user: { id: userId } },
      order: { expiresAt: 'DESC' },
      relations: ['user'],
    });
  }

  async countTokensByUserId(userId: string): Promise<number> {
    return await this.count({ where: { user: { id: userId } } });
  }

  async findIdsToDelete(userId: string, amount: number) {
    return await this.createQueryBuilder('refreshToken')
      .select('refreshToken.id')
      .where('refreshToken.user.id = :userId', { userId })
      .orderBy('refreshToken.expiresAt', 'ASC')
      .limit(amount)
      .getMany();
  }

  async deleteExcessTokensByIds(tokensToDelete: RefreshToken[]): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(RefreshToken)
      .where('id IN (:...ids)', {
        ids: tokensToDelete.map((token) => token.id),
      })
      .execute();
  }
}
