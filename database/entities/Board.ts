import {
  PrimaryGeneratedColumn,
  ManyToOne,
  BaseEntity,
  JoinColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';

import { User } from './User';

@Entity('boards')
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  public pk: number;

  @Column({ type: 'varchar', length: 36, nullable: false })
  public user_pk: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  public title: string;

  @Column({ type: 'text', nullable: false })
  public content: string;

  @Column({ type: 'timestamp' })
  @CreateDateColumn()
  public createdAt: Date;

  @Column({ type: 'timestamp' })
  @UpdateDateColumn()
  public updatedAt: Date;

  @Column({ type: 'timestamp' })
  @DeleteDateColumn()
  public deletedAt: Date;

  @ManyToOne(type => User, {
    cascade: true
  })
  @JoinColumn({ name: 'user_pk' })
  public user: User;
}
