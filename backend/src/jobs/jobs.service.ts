import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus, LOCKED_STATUSES } from '../job.entity';
import { Note } from '../note.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SmartInputParser } from './parser/smart-input.parser';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    private parser: SmartInputParser,
  ) {}

  async findAll(userId: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id, userId },
      relations: { notes: true },
    });
    if (!job) throw new NotFoundException('Job not found');
    job.notes?.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return job!;
  }

  async create(dto: CreateJobDto, userId: string): Promise<Job> {
    const parsed = await this.parser.parse(dto.input, dto.companyName, dto.role);
    const job = this.jobRepository.create({
      ...parsed,
      role: dto.role || parsed.role,
      status: dto.status || 'APPLIED',
      userId,
    });
    return this.jobRepository.save(job) as Promise<Job>;
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    userId: string,
  ): Promise<Job> {
    const job = await this.findOne(id, userId);

    if (LOCKED_STATUSES.includes(job.status)) {
      throw new BadRequestException(
        `Cannot change status — job is ${job.status}`,
      );
    }

    job.status = dto.status;
    return this.jobRepository.save(job);
  }

  async update(
    id: string,
    dto: UpdateJobDto,
    userId: string,
  ): Promise<Job> {
    const job = await this.findOne(id, userId);
    if (dto.companyName !== undefined) job.companyName = dto.companyName;
    if (dto.role !== undefined) job.role = dto.role;
    return this.jobRepository.save(job);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.jobRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Job not found');
    }
  }

  async resolve(
    id: string,
    status: JobStatus,
    noteContent: string,
    userId: string,
  ): Promise<Job> {
    const job = await this.findOne(id, userId);

    if (LOCKED_STATUSES.includes(job.status)) {
      throw new BadRequestException(
        `Cannot change status — job is ${job.status}`,
      );
    }

    job.status = status;
    const saved = await this.jobRepository.save(job);

    if (noteContent?.trim()) {
      const tag: 'rejected' | 'offered' | null =
        status === 'REJECTED' ? 'rejected' :
        status === 'OFFERED' ? 'offered' : null;
      const note = this.noteRepository.create({
        jobId: saved.id,
        content: noteContent.trim(),
        tag,
      });
      await this.noteRepository.save(note);
    }

    return this.findOne(saved.id, userId);
  }

  async addNote(
    jobId: string,
    content: string,
    userId: string,
    tag?: string,
  ): Promise<Note> {
    const job = await this.findOne(jobId, userId);
    const note = this.noteRepository.create({
      jobId: job.id,
      content,
      tag: (tag as Note['tag']) || null,
    });
    return this.noteRepository.save(note) as Promise<Note>;
  }

  async updateNote(noteId: string, content: string, userId: string): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
      relations: { job: true },
    });
    if (!note || note.job.userId !== userId) {
      throw new NotFoundException('Note not found');
    }
    note.content = content;
    return this.noteRepository.save(note);
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
      relations: { job: true },
    });
    if (!note || note.job.userId !== userId) {
      throw new NotFoundException('Note not found');
    }
    await this.noteRepository.remove(note);
  }
}
