import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { SmartInputParser } from './parser/smart-input.parser';
import { Job } from '../job.entity';
import { Note } from '../note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Note])],
  controllers: [JobsController],
  providers: [JobsService, SmartInputParser],
})
export class JobsModule {}
