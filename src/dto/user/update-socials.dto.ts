import { IsOptional, IsString } from 'class-validator';

export class UpdateSocialsDto {
  @IsString()
  @IsOptional()
    facebook: string;

  @IsString()
  @IsOptional()
    twitter: string;

  @IsString()
  @IsOptional()
    instagram: string;

  @IsString()
  @IsOptional()
    discord: string;

  @IsString()
  @IsOptional()
    telegram: string;
}
