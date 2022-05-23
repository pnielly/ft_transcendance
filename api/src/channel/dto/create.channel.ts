import { IsNumber, IsString } from 'class-validator';

export class createChannelDto {
  @IsString()
  name: string;

  @IsString()
  access: string;

  @IsString()
  password?: string;

  @IsNumber()
  userId: number;
}