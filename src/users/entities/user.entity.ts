import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import * as bcrypt from 'bcrypt';
import { UserAuth } from './user_auth.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'username',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: false,
  })
  role: UserRole;

  @OneToMany(() => Task, (task) => task.assignedUserId)
  assignedTasks: Task[];

  @OneToMany(() => Task, (task) => task.createdByUserId)
  createdTasks: Task[];

  @OneToOne(() => UserAuth, (auth) => auth.user, { cascade: true })
  auth: UserAuth;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
