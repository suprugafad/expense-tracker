import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('categories')
@ObjectType('Category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @Field(() => User, { nullable: true })
  user?: User | null;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  @Field(() => [Transaction], { nullable: true })
  transactions?: Transaction[];
}
