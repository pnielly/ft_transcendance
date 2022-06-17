import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ChannelService } from 'src/channel/channel.service';
import { ROLES_KEY } from 'src/utils/roles.decorator';
import { Role } from '../../utils/role.enum';

@Injectable()
export default class RolesGuardsSocket extends AuthGuard('jwt-two-factor') {
  constructor(
    private reflector: Reflector,
    private channelService: ChannelService,
  ) {
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

    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const user = client.data.user;

    if (!data.channelId) return false;

    if (requiredRoles[0] === 'Owner') {
      return this.channelService.isOwner(user, data.channelId);
    } else if (requiredRoles[0] === 'Admin') {
      return this.channelService.isAdmin(user, data.channelId);
    }
    return false;
  }
}
