import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { UpdateSocialsDto } from './update-socials.dto';

export class UpdateUserDto {
  @IsString()
    username: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSocialsDto)
    socials: UpdateSocialsDto;
}
