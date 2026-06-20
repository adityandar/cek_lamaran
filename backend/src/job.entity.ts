import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export type JobStatus = 'APPLIED' | 'IN_PROGRESS' | 'REJECTED' | 'OFFERED';

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  companyName: string;

  @Column({ type: 'varchar', default: 'APPLIED' })
  status: JobStatus;

  @Column({ type: 'varchar', nullable: true })
  sourceUrl: string | undefined;

  @Column({ type: 'text', nullable: true })
  description: string | undefined;

  @Column({ type: 'varchar', nullable: true })
  companyDomain: string | undefined;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
