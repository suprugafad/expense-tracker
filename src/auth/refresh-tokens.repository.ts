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
}
