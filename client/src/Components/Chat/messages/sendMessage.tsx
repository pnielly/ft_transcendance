import { Fab, TextField, Grid } from '@mui/material';
import React, { MouseEvent, useContext, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { UserContext } from '../../../Contexts/userContext';
import { SocketContext } from '../../../Contexts/socket';
import User from '../../Interfaces/user.interface';
import Channel from '../../Interfaces/channel.interface';

type Props = {
  activeChannel: Channel;
  muteList: User[];
};

const SendMessage = (props: Props) => {
  const { activeChannel, muteList } = props;
  const [message, setMessage] = useState<string>('');
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setMessage(e.currentTarget.value);
  }

  function amIMuted() {
    let res: boolean = false;
    muteList.map((e) => (e.id === me.id ? (res = true) : null));
    return res;
  }

  function sendMessage(e: MouseEvent<SVGSVGElement>) {
    // prevent page to reload
    e.preventDefault();
    // check if muted
    if (amIMuted()) alert("You can't send messages because you got muted");
    else {
      //send to server
      sockContext.socketChat.emit('sentMessage', { content: message, senderName: me.username, channelId: activeChannel.id });
      setMessage('');
    }
  }

  return (
    <Grid container sx={{ padding: '9px' }}>
      <Grid item xs={11}>
        <TextField id="outlined-basic-email" label="Type Something" fullWidth onChange={handleChange} value={message} />
      </Grid>
      <Grid item xs={1}>
        <Fab color="primary" aria-label="add">
          <SendIcon type="submit" onClick={sendMessage} />
        </Fab>
      </Grid>
    </Grid>
  );
};

export default SendMessage;
