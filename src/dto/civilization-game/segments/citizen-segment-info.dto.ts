import { CitizenCaveDto } from '../caves/citizen-cave.dto';
import { SegmentsInfoDto } from './segments-info.dto';

export class CitizenSegmentInfoDto extends SegmentsInfoDto {
  caves: CitizenCaveDto[];
}
