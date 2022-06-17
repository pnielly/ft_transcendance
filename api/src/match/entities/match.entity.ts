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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  player1: User;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  player2: User;

  @Column()
  score1: number;

  @Column()
  score2: number;

  @Column()
  winner: number;

  @Column()
  status: string;

  @Column()
  mode: string;

  @CreateDateColumn()
  createdAt: Date;
}
