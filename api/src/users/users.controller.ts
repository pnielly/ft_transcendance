import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get()
  getStatus() {}
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }

  @Post(':id/add_friend_request')
  addFriendRequest(@Param('id') id: number, @Body() param: { fromId: number }) {
    return this.usersService.addFriendRequest(id, param.fromId);
  }

  @Post(':id/add_friend')
  addFriend(@Param('id') id: number, @Body() param: { friendId: number }) {
    return this.usersService.addFriend(id, param.friendId);
  }

  @Get(':id/get_friend_requests')
  getFriendRequests(@Param('id') id: number) {
    return this.usersService.findFriendRequests(id);
  }

  @Get(':id/get_friends')
  getFriends(@Param('id') id: number) {
    return this.usersService.findFriends(id);
  }

  @Get(':id/profile')
  getProfile(@Param('id') id: number) {
    return this.usersService.findProfile(id);
  }

  @Delete(':id/remove_friend_request')
  removeFriendRequest(
    @Param('id') id: number,
    @Body() param: { fromId: number },
  ) {
    return this.usersService.removeFriendRequest(id, param.fromId);
  }

  @Delete(':id/remove_friend')
  removeFriend(@Param('id') id: number, @Body() param: { fromId: number }) {
    return this.usersService.removeFriend(id, param.fromId);
  }
}
