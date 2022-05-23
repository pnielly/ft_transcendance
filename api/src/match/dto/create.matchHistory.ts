import { IsNumber, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsNumber()
  player1: number;

  @IsNumber()
  player2: number;

  @IsNumber()
  score1: number;

  @IsNumber()
  score2: number;

  @IsNumber()
  winner: number;

  @IsString()
  status: 'friendly' | 'ladder';
}
