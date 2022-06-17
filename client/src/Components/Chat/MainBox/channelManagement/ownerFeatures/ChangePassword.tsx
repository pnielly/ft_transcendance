import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../../../Contexts/socket';
import Channel from '../../../../../Interfaces/channel.interface';
import { Button, TextField } from '@mui/material';


type Props = {
  activeChannel: Channel;
  setActiveChannel: (channel: Channel) => void;
};

const ChangePassword = (props: Props) => {
  const { activeChannel, setActiveChannel } = props;
  const sockContext = useContext(SocketContext);
  const [modifyPassword, setModifyPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');

  function updatePassword(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!password.length) return;
    sockContext.socketChat.emit('accessChange', { access: 'protected', password: password, channelId: activeChannel.id });
    setActiveChannel({ ...activeChannel, password: password });
    setPassword('');
  }

  function handlePasswordTyping(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setPassword(e.currentTarget.value);
  }

  return (
    <div>
      <Button onClick={() => setModifyPassword(true)}>Modify Password</Button>
      {modifyPassword ? (
        <form>
          {/* <input type="password" onChange={handlePasswordTyping} value={password} placeholder="Nouveau mot de passe" /> */}
          <TextField type="password" onChange={handlePasswordTyping} value={password} placeholder="Nouveau mot de passe"/>
          <Button type="submit" onClick={updatePassword}>
            Submit
          </Button>
        </form>
      ) : (
        ''
      )}
    </div>
  );
};

export default ChangePassword;
