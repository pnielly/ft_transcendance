import React, { useContext } from 'react';
import { SocketContext } from '../../../../../Contexts/socket';
import { UserContext } from '../../../../../Contexts/userContext';
import { Button } from '@mui/material';
import Channel from '../../../../../Interfaces/channel.interface';
import User from '../../../../../Interfaces/user.interface';

type Props = {
  activeChannel: Channel;
  isAdmin: (user: User) => boolean;
  isBanned: (user: User) => boolean;
  user: User;
};

const Ban = (props: Props) => {
  const { activeChannel, isAdmin, isBanned, user } = props;
  const sockContext = useContext(SocketContext);
  // const [toBan, setToBan] = useState<number>(); // used to select member to ban
  const me = useContext(UserContext).user;

  // BANNING A MEMBER //////////////////////////////////////////

  const banMember = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // add to banList
    sockContext.socketChat.emit('addBan', { channelId: activeChannel.id, bannedId: user.id });
    // remove from memberList
    sockContext.socketChat.emit('removeMember', { channelId: activeChannel.id, memberId: user.id });
  };

  return <div>{!isAdmin(user) && !isBanned(user) ? <Button color="error" onClick={banMember}>{'ban'}</Button> : ''}</div>;
};

export default Ban;
