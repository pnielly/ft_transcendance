import { Fab, TextField, Grid, useMediaQuery } from '@mui/material';
import React, { MouseEvent, useContext, useState, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { UserContext } from '../../../../Contexts/userContext';
import { SocketContext } from '../../../../Contexts/socket';
import User from '../../../../Interfaces/user.interface';
import Channel from '../../../../Interfaces/channel.interface';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import PongInviteDialog from '../../../Users/MainBox/PongInviteDialog';

type Props = {
  activeChannel: Channel;
  muteList: User[];
  memberList: User[];
};

const SendMessage = (props: Props) => {
  const { activeChannel, muteList, memberList } = props;
  const [message, setMessage] = useState<string>('');
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;
  const [showMuted, setShowMuted] = useState<boolean>(false);
  const [inviteSent, setInviteSent] = useState<boolean>(false);
  const [openPongOptions, setOpenPongOptions] = useState<boolean>(false);
  const [option, setOption] = useState<string>('normal');
  const [label, setLabel] = useState<string>('Type something');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setMessage(e.currentTarget.value);
  }

  function amIMuted() {
    let res: boolean = false;
    muteList.map((e) => (e.id === me.id ? (res = true) : null));
    return res;
  }

  function sendMessage(e: any) {
    e.preventDefault();
    // check if muted
    if (amIMuted()) setShowMuted(true);
    else if (!message.length) return;
    else {
      //send to server
      sockContext.socketChat.emit('sentMessage', { content: message, senderName: me.username, channelId: activeChannel.id });
      setMessage('');
    }
  }

  useEffect(() => {
    if (amIMuted()) setLabel('You have been muted.');
    else setLabel('Type something');
  }, [muteList]);

  ////////////////////////// GAME INVITE //////////////////////////////////////////////

  function sendGameInvite(e: MouseEvent<SVGSVGElement>) {
    e.preventDefault();
    setOpenPongOptions(false);
    const guest: User = memberList.filter((e: User) => e.id !== me.id)[0];
    if (option === 'normal') sockContext.socketPong.emit('gameInvitation', { sender: me, guestId: guest.id, options: { doubleBall: false, paddle: false } });
    else if (option === 'doubleBall') sockContext.socketPong.emit('gameInvitation', { sender: me, guestId: guest.id, options: { doubleBall: true, paddle: false } });
    else if (option === 'paddle') sockContext.socketPong.emit('gameInvitation', { sender: me, guestId: guest.id, options: { doubleBall: false, paddle: true } });
    setInviteSent(true);
  }

  //////////////////////////////// SNACKBAR <YOU ARE MUTE> //////////////////////
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowMuted(false);
  };
  //////////////////////////////// SNACKBAR <INVITE SENT> //////////////////////
  const handleCloseInviteSent = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setInviteSent(false);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={9}>
        <TextField
          id="outlined-basic-email"
          label={label}
          fullWidth
          onChange={handleChange}
          value={message}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage(e);
            }
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <Fab color="primary" aria-label="add">
          <SendIcon type="submit" onClick={sendMessage} />
        </Fab>
        {memberList.length === 2 ? (
          <Fab color="secondary" aria-label="add" sx={{ marginLeft: '10px' }}>
            <SportsEsportsIcon type="submit" onClick={() => setOpenPongOptions(!openPongOptions)} />
            <PongInviteDialog open={openPongOptions} setOpen={setOpenPongOptions} sendGameInvite={sendGameInvite} option={option} setOption={setOption} />
          </Fab>
        ) : (
          ''
        )}
        <Snackbar open={showMuted} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
            You can't talk here, you got muted.
          </Alert>
        </Snackbar>
        <Snackbar open={inviteSent} autoHideDuration={6000} onClose={handleCloseInviteSent}>
          <Alert onClose={handleCloseInviteSent} severity="info" sx={{ width: '100%' }}>
            Invite sent.
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>
  );
};

export default SendMessage;
