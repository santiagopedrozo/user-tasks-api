import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'boolean' })
  completed: boolean;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'integer' })
  assignedUserId: number;

  @ManyToOne(() => User, (user) => user.assignedTasks)
  assignedUser: User;

  @Column({ type: 'integer' })
  createdByUserId: number;

  @ManyToOne(() => User, (user) => user.createdTasks)
  createdByUser: User;
}
