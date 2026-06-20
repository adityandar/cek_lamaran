import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('api/jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.jobsService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.findOne(id, user.id);
  }

  @Post()
  create(
    @Body() dto: CreateJobDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.create(dto, user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.updateStatus(id, dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.remove(id, user.id);
  }

  @Post(':id/notes')
  addNote(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.addNote(id, content, user.id);
  }

  @Patch('notes/:noteId')
  updateNote(
    @Param('noteId') noteId: string,
    @Body('content') content: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.updateNote(noteId, content, user.id);
  }

  @Delete('notes/:noteId')
  deleteNote(
    @Param('noteId') noteId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.deleteNote(noteId, user.id);
  }
}
