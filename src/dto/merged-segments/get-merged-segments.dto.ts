import { AutoMap } from '@automapper/classes';

export class GetMergedSegmentsDto {
  @AutoMap()
    id: number;

  @AutoMap()
    imageMini: string;

  @AutoMap()
    image: string;

  @AutoMap()
    siteUrl: string;

  coordinates: string[];
}
