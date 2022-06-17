import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
import { User } from './user.entities';

@Entity()
export class ChatInvite {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @ManyToOne(() => User, (user: User)=> user.chatInvites, { onDelete: 'CASCADE',})
    guest: User;

    @Column({ nullable: true})
    guestId: string

    @Column()
    channelId: string

    @Column()
    channelName: string
}