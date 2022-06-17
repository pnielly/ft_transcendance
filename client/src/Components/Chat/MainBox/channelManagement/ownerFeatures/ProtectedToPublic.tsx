import React, { useContext } from 'react';
import { SocketContext } from '../../../../../Contexts/socket';
import { Button } from '@mui/material';
import Channel from '../../../../../Interfaces/channel.interface';

type Props = {
  activeChannel: Channel;
  setActiveChannel: (channel: Channel) => void;
};

const ProtectedToPublic = (props: Props) => {
  const { activeChannel, setActiveChannel } = props;
  const sockContext = useContext(SocketContext);

  function setPublic(e: React.MouseEvent<HTMLButtonElement>) {
    sockContext.socketChat.emit('accessChange', { access: 'public', password: '', channelId: activeChannel.id });
    setActiveChannel({ ...activeChannel, access: 'public', password: '' });
  }

  return (
    <div>
      <Button onClick={setPublic}>Remove password (go public)</Button>
    </div>
  );
};

export default ProtectedToPublic;
