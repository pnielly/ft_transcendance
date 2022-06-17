import { Button } from '@mui/material';
import React, { useContext } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import { UserContext } from '../../../Contexts/userContext';
import Channel from '../../../Interfaces/channel.interface';

type Props = {
  activeChannel: Channel;
  setActiveChannel: (channel: Channel | undefined) => void;
};

const LeaveChannel = (props: Props) => {
  const { activeChannel, setActiveChannel } = props;
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;

  const leaveChannel = () => {
    sockContext.socketChat.emit('leaveChannel', { channelId: activeChannel.id, userId: me.id });
    setActiveChannel(undefined);
  };

  return (
    <div>
      <Button variant="outlined" color="error" sx={{ marginTop: '20px' }} onClick={leaveChannel}>
        Leave
      </Button>
    </div>
  );
};

export default LeaveChannel;
