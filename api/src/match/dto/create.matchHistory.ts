import { IsNumber, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsNumber()
  player1: string;

  @IsNumber()
  player2: string;

  @IsNumber()
  score1: number;

  @IsNumber()
  score2: number;

  @IsNumber()
  winner: number;

  @IsString()
  status: 'friendly' | 'ranked';

  @IsString()
  mode: 'doubleBall' | 'paddle' | 'normal';
}
