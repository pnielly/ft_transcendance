import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../../../Contexts/socket';
import { UserContext } from '../../../../../Contexts/userContext';
import { Button } from '@mui/material';
import User from '../../../../../Interfaces/user.interface';
import Channel from '../../../../../Interfaces/channel.interface';

type Props = {
  activeChannel: Channel;
  user: User;
  isAdmin: (user: User) => boolean;
};

const SetAdmin = (props: Props) => {
  const { activeChannel, user, isAdmin } = props;
  const me = useContext(UserContext).user;
  const sockContext = useContext(SocketContext);

  // SET NEW ADMIN TO ROOM
  const setMemberAdmin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    sockContext.socketChat.emit('setAdmin', { channelId: activeChannel.id, adminId: user.id });
  };

  return (
    <div>
      {me.id === activeChannel.owner.id && !isAdmin(user) ? (
        <Button color="success" onClick={setMemberAdmin}>
          {'set admin'}
        </Button>
      ) : (
        ''
      )}
    </div>
  );
};

export default SetAdmin;
