import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { create } from 'qrcode';
import { EloService } from 'src/elo/elo.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChatInvite } from './entities/chatInvite.entities';
import { User } from './entities/user.entities';

interface invite {
  channelId: string;
  channelName: string;
  guestId: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatInvite)
    private readonly chatInviteRepository: Repository<ChatInvite>,
    private readonly eloService: EloService,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findFriendRequests(id: string): Promise<User[]> {
    const user = await this.userRepository.findOne(id, {
      relations: ['friendRequests'],
    });
    if (!user) {
      throw new NotFoundException(
        `[FindOne in FriendRequest:] User ${id} not found`,
      );
    }
    return user.friendRequests;
  }

  async findFriends(id: string): Promise<User[]> {
    const user = await this.userRepository.findOne(id, {
      relations: ['friends'],
    });
    if (!user) {
      throw new NotFoundException(`[FindOne:] User ${id} not found`);
    }
    return user.friends;
  }

  async findBlocked(id: string): Promise<User[]> {
    const user = await this.userRepository.findOne(id, {
      relations: ['blocked'],
    });
    if (!user) {
      throw new NotFoundException(`[FindOne:] User ${id} not found`);
    }
    return user.blocked;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`[FindOne:] User ${id} not found`);
    }
    return user;
  }

  async getOne(id: number) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`[FindOne:] User ${id} not found`);
    }
    return user.toResponseObject();
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({ username: username });
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const isInDb = await this.findByUsername(createUserDto.username);
    if (isInDb)
      throw new ForbiddenException(
        `${createUserDto.username} username is already use`,
      );
    const user = this.userRepository.create(createUserDto);
    const saveUser = await this.userRepository.save(user);
    this.eloService.create(user);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`User not found ${id}`);
    }
    if (updateUserDto.username) {
      const check = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (check)
        throw new ForbiddenException(
          `This username ${updateUserDto.username} already exist`,
        );
    }
    return this.userRepository.save(user);
  }

  async findOrCreate(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      username: createUserDto.username,
    });
    if (!user) {
      return this.create(createUserDto);
    }
    return user;
  }

  async findOrCreate42(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      id_42: createUserDto.id_42,
    });
    if (!user) {
      return this.create(createUserDto);
    }
    return user;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }

  async addFriendRequest(id: string, fromId: string) {
    const friend = await this.userRepository.findOne(fromId);
    const user = await this.userRepository.findOne(id, {
      relations: ['friendRequests'],
    });
    console.log('in addFriendRequest')
    user.friendRequests.push(friend);
    return await this.userRepository.save(user);
  }

  async addFriend(id: string, friendId: string) {
    const friend = await this.userRepository.findOne(friendId);
    const user = await this.userRepository.findOne(id, {
      relations: ['friends'],
    });
    user.friends.push(friend);
    return this.userRepository.save(user);
  }

  async addBlock(id: string, blockId: string) {
    const blocked = await this.userRepository.findOne(blockId);
    const user = await this.userRepository.findOne(id, {
      relations: ['blocked'],
    });
    user.blocked.push(blocked);
    return this.userRepository.save(user);
  }

  async findProfile(id: string) {
    const user = await this.userRepository.findOne(id);
  }

  async removeFriendRequest(id: string, fromId: string) {
    const user = await this.userRepository.findOne(id, {
      relations: ['friendRequests'],
    });
    if (!user) return;
    const toDelete = user.friendRequests.findIndex((u) => u.id === fromId);
    user.friendRequests.splice(toDelete, 1);
    return await this.userRepository.save(user);
  }

  async removeFriend(id: string, friendId: string) {
    const user = await this.userRepository.findOne(id, {
      relations: ['friends'],
    });
    if (!user) return;
    const toDelete = user.friends.findIndex((u) => u.id === friendId);
    user.friends.splice(toDelete, 1);
    return await this.userRepository.save(user);
  }

  async removeBlock(id: string, blockId: string) {
    const user = await this.userRepository.findOne(id, {
      relations: ['blocked'],
    });
    if (!user) return;
    const toDelete = user.blocked.findIndex((u) => u.id === blockId);
    user.blocked.splice(toDelete, 1);
    return await this.userRepository.save(user);
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: string) {
    return this.userRepository.update(userId, {
      twoFactorAuthenticationSecret: secret,
    });
  }

  async turnOnTwoFactorAuthentication(userId: string) {
    return this.userRepository.update(userId, {
      isTwoFactorAuthenticationEnabled: true,
    });
  }

  async turnOffTwoFactorAuthentification(userId: string) {
    return this.userRepository.update(userId, {
      isTwoFactorAuthenticationEnabled: false,
      twoFactorAuthenticationSecret: null,
    });
  }

  async addChatInvite(invite: invite) {
    const user: User = await this.userRepository.findOne(invite.guestId, {
      relations: ['chatInvites'],
    });

    // if invite already exists, do nothing
    if (
      user.chatInvites.findIndex(
        (u: ChatInvite) => u.channelId === invite.channelId,
      ) !== -1
    )
      return;
    const chatInvite = new ChatInvite();
    chatInvite.guest = user;
    chatInvite.guestId = user.id;
    chatInvite.channelId = invite.channelId;
    chatInvite.channelName = invite.channelName;
    console.log('addChtinvite')
    return await this.chatInviteRepository.save(chatInvite);
  }

  async removeChatInvite(id: string, channelId: string) {
    const user = await this.userRepository.findOne(id, {
      relations: ['chatInvites'],
    });
    if (!user) return;
    const toDelete = user.chatInvites.findIndex(
      (u: ChatInvite) => u.channelId === channelId,
    );
    user.chatInvites.splice(toDelete, 1);
    return await this.userRepository.save(user);
  }

  async findChatInvites(id: string): Promise<ChatInvite[]> {
    const user = await this.userRepository.findOne(id, {
      relations: ['chatInvites'],
    });
    if (!user) {
      throw new NotFoundException(`[FindOne:] User ${id} not found`);
    }
    return user.chatInvites;
  }

  // HANDLE PASSWORD /////////////////////////////////////
  async verifyPassword(password: string, username: string): Promise<User> {
    const user = await this.findByUsername(username);
    // if the user is a 42 user, it should not pass through this route
    if (user.id_42 !== null) return null;
    const bol = await user.comparePassword(password);
    if (bol === true) return user;
    return null;
  }
}
