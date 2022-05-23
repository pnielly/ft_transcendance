import { Controller, Delete, Get, Param } from '@nestjs/common';
import { EloService } from './elo.service';

@Controller('ranking')
export class EloController {
  constructor(private readonly eloService: EloService) {}
  @Get()
  getRanking() {
    return this.eloService.getRanking();
  }

  @Get(':id')
  getRankingOfOneUser(@Param('id') userId: number) {
    return this.eloService.findRankingOfOneUser(userId);
  }
  @Delete()
  deleteAll() {
    this.eloService.removeAll();
  }
}
