import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { createChannelDto } from './dto/create.channel';
import { createMessageDto } from './dto/create.message';
import { UpdateChannelDto } from './dto/update.channel';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get()
  getAllChannels() {
    return this.channelService.findAll();
  }

  @Post('/user_channels')
  getUserChannels(@Body('id') id: number) {
    return this.channelService.findUserChannels(id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.channelService.findOne(id);
  }

  @Post()
  create(@Body() createdChannel: createChannelDto) {
    return this.channelService.createChannel(createdChannel);
  }

  @Patch(':id/access')
  update(@Param('id') id: number, @Body() UpdateChannelDto: UpdateChannelDto) {
    return this.channelService.update(id, UpdateChannelDto);
  }

  @Delete()
  removeAllChannel() {
    return this.channelService.removeAll();
  }

  @Delete(':id')
  removeChannel(@Param('id') id: number) {
    return this.channelService.remove(id);
  }

  // MESSAGES
  @Post(':id/messages')
  postMessage(@Body() createMessage: createMessageDto) {
    return this.channelService.createMessage(createMessage);
  }

  @Get(':id/messages')
  findAllMessage(@Param('id') channelId: number) {
    return this.channelService.messageList(channelId);
  }

  // PASSWORD
  @Post(':id/check_password')
  checkPassword(
    @Param('id') id: number,
    @Body() password: { password: string },
  ) {
    return this.channelService.verifyPassword(password.password, id);
  }

  // ADMIN
  @Post(':id/add_admin')
  addAdmin(@Param('id') id: number, @Body() param: { adminId: number }) {
    return this.channelService.addAdmin(id, param.adminId);
  }

  @Get(':id/get_admins')
  getAdmins(@Param('id') id: number) {
    return this.channelService.findAdmins(id);
  }

  @Delete(':id/remove_admin')
  removeAdmin(@Param('id') id: number, @Body() param: { adminId: number }) {
    return this.channelService.removeAdmin(id, param.adminId);
  }

  // MEMBER
  @Post(':id/add_member')
  addMember(@Param('id') id: number, @Body() param: { memberId: number }) {
    return this.channelService.addMember(id, param.memberId);
  }

  @Get(':id/get_members')
  async getMembers(@Param('id') id: number) {
    return await this.channelService.findMembers(id);
  }

  @Delete(':id/remove_member')
  removeMember(@Param('id') id: number, @Body() param: { memberId: number }) {
    return this.channelService.removeMember(id, param.memberId);
  }

  // BANNED
  @Post(':id/add_banned')
  addBanned(@Param('id') id: number, @Body() param: { bannedId: number }) {
    return this.channelService.addBanned(id, param.bannedId);
  }

  @Get(':id/get_banned')
  async getBanneds(@Param('id') id: number) {
    return await this.channelService.findBanned(id);
  }

  @Delete(':id/remove_banned')
  removeBanned(@Param('id') id: number, @Body() param: { bannedId: number }) {
    return this.channelService.removeBanned(id, param.bannedId);
  }

  // MUTED
  @Get(':id/get_muted')
  async getMuteds(@Param('id') id: number) {
    return await this.channelService.findMuted(id);
  }
}
