import { AutoMap } from '@automapper/classes';

import { SegmentsMetaDto } from './segments-meta.dto';

export class GetNftSegmentWithMeta {
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

  meta: SegmentsMetaDto;
}
