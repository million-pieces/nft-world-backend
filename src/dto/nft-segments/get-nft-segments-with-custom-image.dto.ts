import { AutoMap } from '@automapper/classes';

export class GetNftSegmentsWithCustomImageDto {
  @AutoMap()
    id: number;

  @AutoMap()
    coordinates: string;

  @AutoMap()
    siteUrl: string;

  @AutoMap()
    imageMini: string;

  @AutoMap()
    image: string;
}
