import { IsString } from 'class-validator';

export class GetNftSegmentCoordinateDto {
  @IsString()
    coordinates: string;
}
