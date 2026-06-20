import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Note } from './note.entity';

export type JobStatus = 'WISHLIST' | 'APPLIED' | 'IN_PROGRESS' | 'REJECTED' | 'OFFERED';

export const LOCKED_STATUSES: JobStatus[] = ['REJECTED', 'OFFERED'];

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  companyName: string;

  @Column({ type: 'varchar', nullable: true })
  role: string | undefined;

  @Column({ type: 'varchar', default: 'APPLIED' })
  status: JobStatus;

  @Column({ type: 'varchar', nullable: true })
  sourceUrl: string | undefined;

  @Column({ type: 'text', nullable: true })
  description: string | undefined;

  @Column({ type: 'varchar', nullable: true })
  companyDomain: string | undefined;

  @OneToMany(() => Note, (note) => note.job, { cascade: true })
  notes: Note[];

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
