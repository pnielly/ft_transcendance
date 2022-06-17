import { Message } from 'src/channel/entities/message.entities';
import { User } from 'src/users/entities/user.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  access: string;

  @Column({ nullable: true })
  password?: string;

  @ManyToOne(() => User, (user: User) => user.ownChannels, { onDelete: 'CASCADE', })
  owner: User;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  members: User[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  admins: User[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  banned: User[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  muted: User[];

  @OneToMany(() => Message, (message) => message.channel, { cascade: true })
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  async hash() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  toResponseObjet() {
    const { id, name, access, owner, members, messages, createdAt } = this;
    return { id, name, access, owner, members, messages, createdAt };
  }
}
