import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../../../Contexts/socket';
import Channel from '../../../../../Interfaces/channel.interface';
import User from '../../../../../Interfaces/user.interface';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Button } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type Props = {
  activeChannel: Channel;
  userList: User[];
  isBanned: (user: User) => boolean;
  isMember: (user: User) => boolean;
};

const InviteToChannel = (props: Props) => {
  const { activeChannel, userList, isBanned, isMember } = props;
  const [inviteSent, setInviteSent] = useState<boolean>(false);
  const sockContext = useContext(SocketContext);
  const usernameList = Array.from(
    userList.filter((e) => !isBanned(e)).filter((e) => !isMember(e)),
    (u) => u.username
  );
  const [value, setValue] = useState<string>('');
  const [name, setName] = useState<string>('');

  // INVITE USER TO CHANNEL ////////////////////////////////////////
  const inviteToChannel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // send invite
    if (name) {
      const guest1 = userList.find((e: User) => e.username === name);
      if (guest1) {
        sockContext.socketChat.emit('inviteChannel', { channelId: activeChannel.id, channelName: activeChannel.name, guestId: guest1.id });
      }
    } else if (value) {
      const guest = userList.find((e: User) => e.username === value);
      if (guest) {
        sockContext.socketChat.emit('inviteChannel', { channelId: activeChannel.id, channelName: activeChannel.name, guestId: guest.id });
      }
    }
    setInviteSent(true)
  };

  // handle input with text
  const handleInput = (e: any) => {
    setValue(e.currentTarget.value);
  };

  // handle input with selection
  const handleChange = (value: string | null) => {
    if (value) {
      setName(value);
    }
  };

  // Snackbar <invite has been sent>
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setInviteSent(false);
  };

  return (
    <div>
      {' '}
      <h4>{'Invite users to room'}</h4>
      <Autocomplete
        disablePortal
        id="ChatInvite"
        options={usernameList}
        sx={{ width: 300 }}
        onChange={(event, value) => handleChange(value)}
        renderInput={(params) => <TextField {...params} label="Invite a user" onChange={handleInput} />}
      />
      <Button type="submit" onClick={inviteToChannel}>
        Invite
      </Button>
      <Snackbar open={inviteSent} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info" sx={{ width: '100%' }}>
          An invite has been sent.
        </Alert></Snackbar>
    </div>
  );
};

export default InviteToChannel;
