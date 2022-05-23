import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Channel } from '../../channel/entities/channel.entities';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_42: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: 'https://material-ui.com/static/images/avatar/1.jpg' })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Channel, (channel) => channel.owner)
  ownChannels: Channel[];

  @ManyToMany(() => User, (user) => user.friendRequests)
  @JoinTable()
  friendRequests: User[];

  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable()
  friends: User[];

  toResponseObject() {
    const { id, id_42, avatar, username } = this;
    return { id, id_42, avatar, username };
  }
}
