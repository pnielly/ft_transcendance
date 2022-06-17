import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/utils/public-route';
import { Roles } from 'src/utils/roles.decorator';
import { Role } from 'src/utils/role.enum';
import RolesGuardsHttp from 'src/auth/guards/roles-http.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @Roles(Role.Me)
  // @UseGuards(RolesGuardsHttp)
  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // @Roles(Role.Me)
  // @UseGuards(RolesGuardsHttp)
  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/add_friend_request')
  addFriendRequest(@Param('id') id: string, @Body() param: { fromId: string }) {
    return this.usersService.addFriendRequest(id, param.fromId);
  }

  @Post(':id/add_friend')
  addFriend(@Param('id') id: string, @Body() param: { friendId: string }) {
    return this.usersService.addFriend(id, param.friendId);
  }

  @Get(':id/get_friend_requests')
  getFriendRequests(@Param('id') id: string) {
    return this.usersService.findFriendRequests(id);
  }

  @Get(':id/get_friends')
  getFriends(@Param('id') id: string) {
    return this.usersService.findFriends(id);
  }

  @Get(':id/get_blocked')
  getBlocked(@Param('id') id: string) {
    return this.usersService.findBlocked(id);
  }

  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.usersService.findProfile(id);
  }

  @Delete(':id/remove_friend_request')
  removeFriendRequest(
    @Param('id') id: string,
    @Body() param: { fromId: string },
  ) {
    return this.usersService.removeFriendRequest(id, param.fromId);
  }

  @Delete(':id/remove_friend')
  removeFriend(@Param('id') id: string, @Body() param: { fromId: string }) {
    return this.usersService.removeFriend(id, param.fromId);
  }

  @Get(':id/get_chat_invites')
  getChatInvites(@Param('id') id: string) {
    return this.usersService.findChatInvites(id);
  }

    // PASSWORD
    @Public()
    @Post(':username/check_password')
    checkPassword(
      @Param('username') username: string,
      @Body() password: { password: string },
    ) {
      return this.usersService.verifyPassword(password.password, username);
    }
}
