import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // private readonly pongGateway: PongGateway
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findFriendRequests(id: number): Promise<User[]> {
    const user = await this.userRepository.findOne(id, {
      relations: ['friendRequests'],
    });
    if (!user) {
      throw new NotFoundException(`[FindOne:] User ${id} not found`);
    }
    return user.friendRequests;
  }

  async findFriends(id: number): Promise<User[]> {
    const user = await this.userRepository.findOne(id, {
      relations: ['friends'],
    });
    if (!user) {
      throw new NotFoundException(`[FindOne:] User ${id} not found`);
    }
    return user.friends;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`[FindOne:] User ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({ username: username });
    if (!user) throw new NotFoundException();
    return user;
  }

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    const saveUser = this.userRepository.save(user);
    return user.toResponseObject();
  }

  async updatePicture(username: string, url: string) {
    const user = await this.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`[Update:] User #${username} not found`);
    }
    user.avatar = url;
    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    return this.userRepository.update(id, updateUserDto);
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

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }

  async addFriendRequest(id: number, fromId: number) {
    const friend = await this.userRepository.findOne(fromId);
    const user = await this.userRepository.findOne(id, {
      relations: ['friendRequests'],
    });
    user.friendRequests.push(friend);
    this.userRepository.save(user);
  }

  async addFriend(id: number, friendId: number) {
    const friend = await this.userRepository.findOne(friendId);
    const user = await this.userRepository.findOne(id, {
      relations: ['friends'],
    });
    user.friends.push(friend);
    this.userRepository.save(user);
  }

  async findProfile(id: number) {
    const user = await this.userRepository.findOne(id);
  }
  async removeFriendRequest(id: number, fromId: number) {
    const user = await this.userRepository.findOne(id, {
      relations: ['friendRequests'],
    });
    const toDelete = user.friendRequests.findIndex((u) => u.id === fromId);
    user.friendRequests.splice(toDelete, 1);
    this.userRepository.save(user);
  }

  async removeFriend(id: number, friendId: number) {
    const user = await this.userRepository.findOne(id, {
      relations: ['friends'],
    });
    const toDelete = user.friends.findIndex((u) => u.id === friendId);
    user.friends.splice(toDelete, 1);
    this.userRepository.save(user);
  }
}
