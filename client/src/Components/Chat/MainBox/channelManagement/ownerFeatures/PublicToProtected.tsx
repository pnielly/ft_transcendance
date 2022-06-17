import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../../../Contexts/socket';
import Channel from '../../../../../Interfaces/channel.interface';
import { Button, TextField} from '@mui/material';


type Props = {
  activeChannel: Channel;
  setActiveChannel: (channel: Channel) => void;
};

const PublicToProtected = (props: Props) => {
  const { activeChannel, setActiveChannel } = props;
  const [newPassword, setNewPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const sockContext = useContext(SocketContext);

  async function setProtected(e: React.MouseEvent<HTMLButtonElement>) {
    if (!password.length) return;
    sockContext.socketChat.emit('accessChange', { access: 'protected', password: password, channelId: activeChannel.id });
    // necessary to trigger rerender
    setActiveChannel({ ...activeChannel, access: 'protected', password: password });
    setPassword('');
  }

  function handlePasswordTyping(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setPassword(e.currentTarget.value);
  }

  return (
    <div>
      <Button variant="contained" onClick={() => setNewPassword(!newPassword)}>Set a password</Button>
      {newPassword ? (
        <div>
          
          <TextField type="password" onChange={handlePasswordTyping} value={password} placeholder="Tapez votre mot de passe" />
          <Button type="submit" onClick={setProtected}>
            Submit
          </Button>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default PublicToProtected;
