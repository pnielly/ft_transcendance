import React, { useContext } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import Channel from '../../Interfaces/channel.interface';

type Props = {
  activeChannel: Channel;
};

const ProtectedToPublic = (props: Props) => {
  const { activeChannel } = props;
  const sockContext = useContext(SocketContext);

  function setPublic(e: React.MouseEvent<HTMLButtonElement>) {
    sockContext.socketChat.emit('accessChange', { access: 'public', password: '', channelId: activeChannel.id });
  }

  return (
    <div>
      <button onClick={setPublic}>Remove password (go public)</button>
    </div>
  );
};

export default ProtectedToPublic;
