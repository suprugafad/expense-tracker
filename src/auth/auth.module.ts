import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { AuthResolver } from './auth.resolver';
import { UsersRepository } from './users.repository';
import { UsersResolver } from './users.resolver';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: async () => ({
        global: true,
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '10h' },
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
  ],
})
export class AuthModule {}
