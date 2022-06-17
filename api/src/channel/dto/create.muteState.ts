import { IsNumber } from 'class-validator';
export class createMuteStateDto {
@IsNumber()
    channelId: string;
  
  @IsNumber()
  userId: string;

  @IsNumber()
  muteTime: number;

}
