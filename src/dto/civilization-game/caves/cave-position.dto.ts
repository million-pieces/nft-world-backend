import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class CavePositionDto {
  @IsInt()
  @Min(1)
  @Max(3)
  @Type(() => Number)
    position: number;
}
