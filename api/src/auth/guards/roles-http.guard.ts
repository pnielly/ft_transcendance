import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { ROLES_KEY } from 'src/utils/roles.decorator';
import { Role } from '../../utils/role.enum';

@Injectable()
export default class RolesGuardsHttp extends AuthGuard('jwt-two-factor') {
  constructor(private reflector: Reflector, private userService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (requiredRoles[0] === 'Me') {
      if (request.user.id === request.params.id) return true;
    }
    // if (
    //   requiredRoles[0] === 'SuperUser' ||
    //   (requiredRoles[1] && requiredRoles[1] === 'SuperUser')
    // ) {
    //   if (request.user.username === 'admin') return true;
    // }
    return false;
  }
}
