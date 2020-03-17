import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Repository,
  OneToMany,
  BaseEntity
} from 'typeorm';

import { catchDBError } from '@Lib/error';
import { Board } from './Board';
import { Comment } from './comment';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public pk: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public password: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public passwordKey: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public name: string;

  @Column('timestamp')
  @CreateDateColumn()
  public createdAt: Date;

  @Column('timestamp')
  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToMany(
    type => Board,
    board => board.user
  )
  public board: Board[];

  @OneToMany(
    type => Comment,
    comment => comment.user
  )
  public boardComment: Comment[];
}

export const findByPk: (
  userRepository: Repository<User>,
  pk: User['pk']
) => Promise<User> | undefined = async (userRepository, pk) => {
  const user: User = await userRepository
    .findOne({
      where: {
        pk
      }
    })
    .catch(catchDBError());

  return user;
};

export const findByEmail: (
  userRepository: Repository<User>,
  email: User['email']
) => Promise<User> | undefined = async (userRepository, email) => {
  const user: User = await userRepository
    .findOne({
      where: {
        email
      }
    })
    .catch(catchDBError());

  return user;
};
