import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import Channel from '../../Interfaces/channel.interface';

type Props = {
  activeChannel: Channel;
};

const ChangePassword = (props: Props) => {
  const { activeChannel } = props;
  const sockContext = useContext(SocketContext);
  const [modifyPassword, setModifyPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');

  function updatePassword(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    sockContext.socketChat.emit('accessChange', { access: 'protected', password: password, channelId: activeChannel.id });
  }

  function handlePasswordTyping(e: React.FormEvent<HTMLInputElement>) {
    setPassword(e.currentTarget.value);
  }

  return (
    <div>
      <button onClick={() => setModifyPassword(true)}>Modify Password</button>
      {modifyPassword ? (
        <form>
          <input type="password" onChange={handlePasswordTyping} value={password} placeholder="Nouveau mot de passe" />
          <button type="submit" onClick={updatePassword}>
            Submit
          </button>
        </form>
      ) : (
        ''
      )}
    </div>
  );
};

export default ChangePassword;
