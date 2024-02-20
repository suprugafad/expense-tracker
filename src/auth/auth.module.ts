import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { AuthResolver } from './auth.resolver';
import { UsersRepository } from './users.repository';
import { UsersResolver } from './users.resolver';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    AuthService,
    UsersService,
    UsersRepository,
    UsersResolver,
    AuthResolver,
  ],
})
export class AuthModule {}
