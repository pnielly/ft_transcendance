import { Injectable } from '@nestjs/common';
import { Match, ball, player, Options } from './interfaces/pong.interfaces';

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_RADIUS = 10;
const CANVAS_HEIGHT = 400;
const CANVAS_WIDTH = 600;
const SCORE_TO_WIN = 5;
const INITIAL_VELOCITY = 5;
const TOLERANCE = 10;

@Injectable()
export class PongService {
  constructor() {}

  createGameState(options: Options): Match {
    return {
      playerLeft: {
        x: 0,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: 'GREEN',
        score: 0,
      },
      playerRight: {
        x: CANVAS_WIDTH - PADDLE_WIDTH,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: 'RED',
        score: 0,
      },
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: BALL_RADIUS,
        acceleration: 1.03,
        velocityX: INITIAL_VELOCITY,
        velocityY: INITIAL_VELOCITY,
        color: 'WHITE',
      },
      ballBonus: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: BALL_RADIUS,
        acceleration: 1.03,
        velocityX: -INITIAL_VELOCITY,
        velocityY: -INITIAL_VELOCITY,
        color: 'YELLOW',
      },
      isFinish: false,
      options: { ...options },
    };
  }

  updateBallBonus(match: Match) {
    match.ballBonus.x += match.ballBonus.velocityX;
    match.ballBonus.y += match.ballBonus.velocityY;

    // this.ballBonus/canvas collision
    if (
      match.ballBonus.y + match.ballBonus.radius > CANVAS_HEIGHT ||
      match.ballBonus.y - match.ballBonus.radius < 0
    ) {
      match.ballBonus.velocityY *= -1;
    }

    // this.ballBonus/players collision
    let player =
      match.ballBonus.x < CANVAS_WIDTH / 2
        ? match.playerLeft
        : match.playerRight;

    if (this.collision(match.ballBonus, player)) {
      match.ballBonus.velocityX *= -1;
      // match.ballBonus.velocityX *= match.ballBonus.acceleration;
      // match.ballBonus.velocityY *= match.ballBonus.acceleration;
    }

    // update score
    if (match.ballBonus.x + match.ballBonus.radius < 0) {
      match.playerRight.score++;
      this.resetBall(match, true);
    } else if (match.ballBonus.x - match.ballBonus.radius > CANVAS_WIDTH) {
      match.playerLeft.score++;
      this.resetBall(match, true);
    }
  }

  updateMatch(match: Match): number {
    if (match.options.doubleBall === true) this.updateBallBonus(match);
    // moving the this.ball
    match.ball.x += match.ball.velocityX;
    match.ball.y += match.ball.velocityY;

    // this.ball/canvas collision
    if (
      match.ball.y + match.ball.radius > CANVAS_HEIGHT ||
      match.ball.y - match.ball.radius < 0
    ) {
      match.ball.velocityY *= -1;
    }

    // this.ball/players collision
    let player =
      match.ball.x < CANVAS_WIDTH / 2 ? match.playerLeft : match.playerRight;

    if (this.collision(match.ball, player)) {
      if (
        (player.y + player.height - TOLERANCE <
          match.ball.y - match.ball.radius &&
          match.ball.velocityY < 0) ||
        (player.y + TOLERANCE > match.ball.y + match.ball.radius &&
          match.ball.velocityY > 0)
      ) {
        match.ball.velocityY *= -1;
      } else if (
        (player.x === match.playerLeft.x && match.ball.velocityX < 0) ||
        (player.x === match.playerRight.x && match.ball.velocityX > 0)
      ) {
        match.ball.velocityX *= -1;
      }
      match.ball.velocityX *= match.ball.acceleration;
      match.ball.velocityY *= match.ball.acceleration;
    }

    // update score
    if (match.ball.x + match.ball.radius < 0) {
      match.playerRight.score++;
      this.resetBall(match, false);
      if (match.options.paddle) {
        match.playerRight.height *= 0.75;
        match.playerLeft.height *= 1.25;
      }
    } else if (match.ball.x - match.ball.radius > CANVAS_WIDTH) {
      match.playerLeft.score++;
      this.resetBall(match, false);
      if (match.options.paddle) {
        match.playerLeft.height *= 0.75;
        match.playerRight.height *= 1.25;
      }
    }

    // prevent paddles from leaving map
    if (match.playerLeft.y < 0) match.playerLeft.y = 0;
    if (match.playerRight.y < 0) match.playerRight.y = 0;
    if (match.playerLeft.y + match.playerLeft.height > CANVAS_HEIGHT)
      match.playerLeft.y = CANVAS_HEIGHT - match.playerLeft.height;
    if (match.playerRight.y + match.playerRight.height > CANVAS_HEIGHT)
      match.playerRight.y = CANVAS_HEIGHT - match.playerRight.height;

    // Is Ending Game ?
    if (match.playerLeft.score >= SCORE_TO_WIN) return 1;
    if (match.playerRight.score >= SCORE_TO_WIN) return 2;

    return 0;
  }
  // COMPUTING FUNCTIONS
  collision(b: ball, p: player) {
    const bTop = b.y - b.radius;
    const bBottom = b.y + b.radius;
    const bLeft = b.x - b.radius;
    const bRight = b.x + b.radius;

    const pTop = p.y;
    const pBottom = p.y + p.height;
    const pLeft = p.x;
    const pRight = p.x + p.width;

    // returns true if collision between ball and players'paddle
    return bRight > pLeft && bLeft < pRight && bTop < pBottom && bBottom > pTop;
  }

  resetBall(match: Match, bonus: boolean) {
    if (bonus) {
      match.ballBonus.x = CANVAS_WIDTH / 2;
      match.ballBonus.y = CANVAS_WIDTH / 2;

      match.ballBonus.velocityY = -INITIAL_VELOCITY;
      if (match.ballBonus.velocityX <= 0)
        match.ballBonus.velocityX = INITIAL_VELOCITY;
      else match.ball.velocityX = -INITIAL_VELOCITY;
    } else {
      match.ball.x = CANVAS_WIDTH / 2;
      match.ball.y = CANVAS_WIDTH / 2;

      match.ball.velocityY = INITIAL_VELOCITY;
      if (match.ball.velocityX > 0) match.ball.velocityX = -INITIAL_VELOCITY;
      else match.ball.velocityX = INITIAL_VELOCITY;
    }
  }
}
