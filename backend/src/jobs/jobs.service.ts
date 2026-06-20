import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { SmartInputParser } from './parser/smart-input.parser';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private parser: SmartInputParser,
  ) {}

  async findAll(userId: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async create(dto: CreateJobDto, userId: string): Promise<Job> {
    const parsed = this.parser.parse(dto.input, dto.companyName);
    const job = this.jobRepository.create({
      ...parsed,
      userId,
    });
    return this.jobRepository.save(job) as Promise<Job>;
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    userId: string,
  ): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id, userId },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    job.status = dto.status;
    return this.jobRepository.save(job);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.jobRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Job not found');
    }
  }
}
