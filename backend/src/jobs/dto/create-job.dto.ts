import { IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
import type { JobStatus } from '../../job.entity';

export class CreateJobDto {
  @IsString()
  @MinLength(1)
  input: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsEnum(['WISHLIST', 'APPLIED', 'IN_PROGRESS', 'REJECTED', 'OFFERED'])
  status?: JobStatus;
}
