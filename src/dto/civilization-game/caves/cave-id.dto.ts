import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CaveIdDto {
  @IsInt()
  @Type(() => Number)
    id: number;
}
