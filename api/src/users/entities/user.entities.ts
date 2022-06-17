import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  BeforeInsert,
} from 'typeorm';
import { Channel } from '../../channel/entities/channel.entities';
import { ChatInvite } from './chatInvite.entities';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  id_42: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: 'https://media.istockphoto.com/vectors/anonymity-concept-icon-in-neon-line-style-vector-id1259924572?k=20&m=1259924572&s=612x612&w=0&h=Xeii8p8hOLrH84PO4LJgse5VT7YSdkQY_LeZOjy-QD4=' })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Channel, (channel: Channel) => channel.owner)
  ownChannels: Channel[];

  @ManyToMany(() => User, (user: User) => user.friendRequests, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  friendRequests: User[];

  @ManyToMany(() => User, (user: User) => user.friends, { onDelete: 'CASCADE' })
  @JoinTable()
  friends: User[];

  @ManyToMany(() => User, (user: User) => user.blocked, { onDelete: 'CASCADE' })
  @JoinTable()
  blocked: User[];

  @OneToMany(() => ChatInvite, (chatInvite: ChatInvite) => chatInvite.guest)
  chatInvites: ChatInvite[];

  // Maybe Not return the secret and Hash It
  @Column({ nullable: true })
  twoFactorAuthenticationSecret?: string;

  @Column({ default: false })
  isTwoFactorAuthenticationEnabled: boolean;

  @Column({nullable: true})
  password?: string;

  @BeforeInsert()
  async hash() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(attempt: string) {
    if (this.password) return await bcrypt.compare(attempt, this.password);
    return false;
  }

  toResponseObject() {
    const { id, id_42, avatar, username, isTwoFactorAuthenticationEnabled } =
      this;
    return { id, id_42, avatar, username, isTwoFactorAuthenticationEnabled };
  }
}
