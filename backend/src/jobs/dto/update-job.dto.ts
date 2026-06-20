import { IsString, IsOptional } from 'class-validator';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
