import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class GetCoordinatesDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
    coordinates: string[];
}
