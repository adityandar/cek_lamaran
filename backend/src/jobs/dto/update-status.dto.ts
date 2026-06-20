import { IsEnum } from 'class-validator';
import type { JobStatus } from '../../job.entity';

export class UpdateStatusDto {
  @IsEnum(['WISHLIST', 'APPLIED', 'IN_PROGRESS', 'REJECTED', 'OFFERED'])
  status: JobStatus;
}
