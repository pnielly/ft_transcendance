import { User } from 'src/users/entities/user.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  player1: User;

  @ManyToOne(() => User, (user) => user.id)
  player2: User;

  @Column()
  score1: number;

  @Column()
  score2: number;

  @Column()
  winner: number;

  @Column()
  status: 'friendly' | 'ladder';

  @CreateDateColumn()
  createdAt: Date;
}
