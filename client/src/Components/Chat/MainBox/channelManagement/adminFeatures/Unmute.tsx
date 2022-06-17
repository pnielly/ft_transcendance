import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../../../Contexts/socket';
import { Button } from '@mui/material';
import Channel from '../../../../../Interfaces/channel.interface';
import User from '../../../../../Interfaces/user.interface';

type Props = {
  muteList: User[];
  activeChannel: Channel;
  user: User;
};

const Unmute = (props: Props) => {
  const { muteList, activeChannel, user } = props;
  const sockContext = useContext(SocketContext);

  // UNMUTE A MEMBER //////////////////////////////////////////////////
  const unmuteMember = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // remove from muteList
    sockContext.socketChat.emit('removeMute', { channelId: activeChannel.id, muteId: user.id });
  };

  const isMute = (user: User) => {
    let res: boolean = false;
    muteList.map((u) => (u.id === user.id ? (res = true) : null));
    return res;
  };

  return (
    <div>
      {isMute(user) ? (
        <div>
          <Button onClick={unmuteMember}>{'unmute'}</Button>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default Unmute;
