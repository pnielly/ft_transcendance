import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../match/dto/pagination-query.dto';
import { EloService } from './elo.service';

@Controller('ranking')
export class EloController {
  constructor(private readonly eloService: EloService) {}
  @Get()
  getRanking(@Query() paginationQuery: PaginationQueryDto) {
    return this.eloService.getRanking(paginationQuery);
  }

  @Get(':id')
  getRankingOfOneUser(@Param('id') userId: string) {
    return this.eloService.findRankingOfOneUser(userId);
  }

  @Get('stats/:id')
  getStatsofOneUser(@Param('id') userId: string) {
    return this.eloService.findStatsOfOneUser(userId);
  }

  @Delete()
  deleteAll() {
    this.eloService.removeAll();
  }
}
