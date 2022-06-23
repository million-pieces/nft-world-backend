import { IsUrl } from 'class-validator';

export class UpdateMergedSegmentDto {
  @IsUrl()
    siteUrl: string;
}
