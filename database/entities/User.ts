import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Repository
} from 'typeorm';

import { catchDBError } from '@Lib/error';

@Entity('users')
export class User {
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
