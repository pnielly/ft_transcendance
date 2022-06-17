import { Request } from 'express';
import { User } from '../../users/entities/user.entities';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
