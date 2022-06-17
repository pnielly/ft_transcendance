import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateMatchDto } from './dto/create.matchHistory';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  findAll() {
    return this.matchService.findAll();
  }

  @Get('history/:id')
  findRankedMatchHistoryOfUser(
    @Param('id') userId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.matchService.getMatchHistoryOfUser(userId, paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchService.findOne(id);
  }

  @Post()
  createMatch(@Body() createMatch: CreateMatchDto) {
    return this.matchService.createMatch(createMatch);
  }

  @Delete(':id')
  removeOne(@Param('id') id: string) {
    return this.matchService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.matchService.removeAll();
  }
}
