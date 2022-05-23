import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import Channel from '../../Interfaces/channel.interface';

type Props = {
  activeChannel: Channel;
};

const PublicToProtected = (props: Props) => {
  const { activeChannel } = props;
  const [newPassword, setNewPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const sockContext = useContext(SocketContext);

  async function setProtected(e: React.MouseEvent<HTMLButtonElement>) {
    sockContext.socketChat.emit('accessChange', { access: 'protected', password: password, channelId: activeChannel.id });
    setPassword('');
  }

  function handlePasswordTyping(e: React.FormEvent<HTMLInputElement>) {
    setPassword(e.currentTarget.value);
  }

  return (
    <div>
      <button onClick={() => setNewPassword(!newPassword)}>Set a password</button>
      {newPassword ? (
        <div>
          <input type="password" onChange={handlePasswordTyping} value={password} placeholder="Tapez votre mot de passe" minLength={1} />
          <button type="submit" onClick={setProtected}>
            Submit
          </button>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default PublicToProtected;
