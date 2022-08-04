import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetNftSegmentIdDto {
  @IsInt()
  @Type(() => Number)
    id: number;
}
