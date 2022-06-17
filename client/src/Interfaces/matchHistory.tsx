import User from "./user.interface";

interface MatchHistory {
    id: string;
    score1: number;
    score2: number;
    winner: number;
    createdAt: Date;
    player1: User;
    player2: User;
    status: 'ranked' | 'friendly' ;
    mode: 'normal' | 'doubleBall' | 'paddle';
  }

  export default MatchHistory;