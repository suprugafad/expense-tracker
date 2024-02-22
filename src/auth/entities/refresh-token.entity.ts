import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity('refresh_tokens')
@ObjectType('RefreshToken')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  jtiHash: string;

  @Column()
  @Field()
  expiresAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
