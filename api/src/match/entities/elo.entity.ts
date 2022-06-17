import { User } from 'src/users/entities/user.entities';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Elo {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  win: number;

  @Column()
  defeat: number;

  @Column()
  points: number;

  toResponseObject() {
    const { win, defeat, points } = this;
    return { win, defeat, points };
  }
}
