import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { Board } from './Board';

@Entity('comments')
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  public pk: number;

  @Column({ type: 'uuid', length: 36, nullable: false })
  public user_pk: string;

  @Column({ type: 'unsigned big int', nullable: false })
  public board_pk: number;

  @Column({ type: 'text', nullable: false })
  public content: string;

  @Column({ type: 'timestamptz' })
  @CreateDateColumn()
  public createdAt: string;

  @Column({ type: 'timestamptz' })
  @UpdateDateColumn()
  public updatedAt: string;

  @ManyToOne(type => User, {
    cascade: true
  })
  @JoinColumn({ name: 'user_pk' })
  public user: User;

  @ManyToOne(type => Board, {
    cascade: true
  })
  @JoinColumn({ name: 'board_pk' })
  public board: Board;
}
