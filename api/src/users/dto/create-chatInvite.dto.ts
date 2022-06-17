import { IsString } from 'class-validator';

export class CreateChatInviteDto {
  @IsString()
  readonly channelId: string;

  @IsString()
  readonly channelName: string;

  @IsString()
  readonly guestId: string;
}