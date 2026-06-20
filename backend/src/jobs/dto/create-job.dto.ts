import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @MinLength(1)
  input: string;

  @IsOptional()
  @IsString()
  companyName?: string;
}
