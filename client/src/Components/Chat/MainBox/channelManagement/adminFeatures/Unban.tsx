import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../../../Contexts/socket';
import { UserContext } from '../../../../../Contexts/userContext';
import { Button } from '@mui/material';
import User from '../../../../../Interfaces/user.interface';
import Channel from '../../../../../Interfaces/channel.interface';

type Props = {
  banList: User[];
  activeChannel: Channel;
  user: User;
};

const Unban = (props: Props) => {
  const { activeChannel, banList, user } = props;
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;
  const [isB, setIsB] = useState(false);

  // UNBANNING A MEMBER ////////////////////////////////////////////
  const unbanMember = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // remove from banList
    sockContext.socketChat.emit('removeBan', { channelId: activeChannel.id, bannedId: user.id });
    // add to memberList
    sockContext.socketChat.emit('addMember', { channelId: activeChannel.id, memberId: user.id });
  };
  useEffect(() => {
    setIsB(isBanned(user));
  }, [banList]);
  const isBanned = (user: User) => {
    let res: boolean = false;
    banList.map((u) => (u.id === user.id ? (res = true) : null));
    return res;
  };

  return <div>{isB ? <Button onClick={unbanMember}>{'unban'}</Button> : ''}</div>;
};

export default Unban;
