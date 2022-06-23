import { IsUrl } from 'class-validator';

export class UpdateSegmentDto {
  @IsUrl()
    siteUrl: string;
}
