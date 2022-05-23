import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async findOrCreate(UserDto: CreateUserDto) {
    return await this.userService.findOrCreate(UserDto);
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  async findMe(user: any) {
    const me = await this.userService.findByUsername(user.username);
    if (me) return me.toResponseObject();
    return null;
  }
  /*
    Cheat code for for add new user whithout 42 
  */
  async validateCheatUser(username: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user) return user.toResponseObject();
    return null;
  }
}
