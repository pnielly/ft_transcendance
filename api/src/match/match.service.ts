import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { gameRoom, userInfo } from 'src/pong/interfaces/pong.interfaces';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateMatchDto } from './dto/create.matchHistory';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { EloService } from '../elo/elo.service';
import { Elo } from './entities/elo.entity';
import { Match } from './entities/match.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly eloService: EloService,
    private readonly userService: UsersService,
  ) {}

  findAll(): Promise<Match[]> {
    return this.matchRepository.find({ relations: ['player1', 'player2'] });
  }

  async getMatchHistoryOfUser(
    userId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<Match[]> {
    const { limit, offset } = paginationQuery;
    const history = await this.matchRepository.find({
      relations: ['player1', 'player2'],
      where: [{ player1: userId }, { player2: userId }],
      skip: offset,
      take: limit,
    });
    return history.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne(id, {
      relations: ['player1', 'player2'],
    });
    if (!match) {
      throw new NotFoundException(`Match ${id} not found`);
    }
    return match;
  }

  async createMatch(createMatch: CreateMatchDto) {
    const player1 = await this.userService.findOne(createMatch.player1);
    const player2 = await this.userService.findOne(createMatch.player2);
    const match = new Match();
    match.player1 = player1;
    match.player2 = player2;
    match.score1 = createMatch.score1;
    match.score2 = createMatch.score2;
    match.winner = createMatch.winner;
    match.status = createMatch.status;
    match.mode = createMatch.mode;
    this.matchRepository.save(match);
    return match;
  }

  async remove(id: string) {
    const match = await this.findOne(id);
    return this.matchRepository.remove(match);
  }

  async removeAll() {
    const matchList = await this.matchRepository.find();
    this.matchRepository.remove(matchList);
  }

  probability(rating1: number, rating2: number): number {
    return (
      (1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400))
    );
  }

  calculateNewElo(elo1: Elo, elo2: Elo) {
    const p1 = this.probability(elo1.points, elo2.points);
    const p2 = this.probability(elo2.points, elo1.points);
  }

  async updateEloPlayer(update: {
    user1: userInfo;
    user2: userInfo;
    winner: number;
  }) {
    const K = 30;
    // Find or create Elo from User
    const elo1 = await this.eloService.findElo(update.user1);
    const elo2 = await this.eloService.findElo(update.user2);
    // Get Probability of winning
    const p1 = this.probability(elo1.points, elo2.points);
    const p2 = this.probability(elo2.points, elo1.points);
    // Update points depend on winner
    if (update.winner === 1) {
      elo1.win++;
      elo2.defeat++;
      elo1.points = Math.round(elo1.points + K * (1 - p1));
      elo2.points = Math.round(elo2.points + K * (0 - p2));
    } else {
      elo2.win++;
      elo1.defeat++;
      elo1.points = Math.round(elo1.points + K * (0 - p1));
      elo2.points = Math.round(elo2.points + K * (1 - p2));
    }
    return this.eloService.save(elo1, elo2);
  }
  // Helper Function
  setStatusOfMatch(game: gameRoom) {
    if (game.friendly) return 'friendly';
    return 'ranked';
  }

  setModeOfMatch(game: gameRoom) {
    if (game.state.options.doubleBall) return 'doubleBall';
    if (game.state.options.paddle) return 'paddle';
    return 'normal';
  }
}
