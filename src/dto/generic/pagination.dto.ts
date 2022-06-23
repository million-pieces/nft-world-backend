import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class PaginationDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
    limit: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
    offset: number;
}
