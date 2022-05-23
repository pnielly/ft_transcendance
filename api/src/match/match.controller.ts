import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
} from '@nestjs/common';
import { CreateMatchDto } from './dto/create.matchHistory';
import { EloService } from './elo.service';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  findAll() {
    return this.matchService.findAll();
  }

  @Get('historyfriendly/:id')
  findFriendlyMatchHistoryOfUser(@Param('id') userId: number) {
    return this.matchService.getMatchHistoryOfUser(userId, 'friendly');
  }

  @Get('historyladder/:id')
  findLadderMatchHistoryOfUser(@Param('id') userId: number) {
    return this.matchService.getMatchHistoryOfUser(userId, 'ladder');
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.matchService.findOne(id);
  }

  @Post()
  createMatch(@Body() createMatch: CreateMatchDto) {
    return this.matchService.createMatch(createMatch);
  }

  @Delete(':id')
  removeOne(@Param('id') id: number) {
    return this.matchService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.matchService.removeAll();
  }
}
