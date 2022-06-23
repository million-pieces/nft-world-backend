import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetMergedSegmentIdDto {
  @IsInt()
  @Type(() => Number)
    id: number;
}
