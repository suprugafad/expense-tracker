import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionTypeEnum } from '../transaction-type.enum';

@Entity('transactions')
@ObjectType('Transaction')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'decimal', scale: 2 })
  @Field()
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionTypeEnum,
  })
  @Field(() => TransactionTypeEnum)
  type: TransactionTypeEnum;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  @Field()
  date: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @Field(() => User)
  user: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  @Field(() => Category)
  category: Category;
}
