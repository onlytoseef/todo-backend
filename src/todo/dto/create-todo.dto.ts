import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
