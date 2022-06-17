import User from './user.interface';

export interface GameResult {
  player1: User;
  player2: User;
  score1: number;
  score2: number;
  winner: number;
  status: string;
}
