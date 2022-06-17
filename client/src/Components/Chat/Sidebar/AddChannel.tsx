import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import { UserContext } from '../../../Contexts/userContext';
import { TextField, Button, FormControl, InputLabel, MenuItem } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type Props = {
  openForm: boolean;
};

const AddChannelForm = (props: Props) => {
  const { openForm } = props;
  const [channelName, setChannelName] = useState<string>('');
  const [channelAccess, setChannelAccess] = useState<string>('public');
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const me = useContext(UserContext).user;
  const sockContext = useContext(SocketContext);
  const [showForbiddenChannelName, setShowForbiddenChannelName] = useState<boolean>(false);


  // CHANNEL CREATION //////////////////////////////////////////
  function handleNameTyping(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setChannelName(e.currentTarget.value);
  }

  const updateAccess = (e: SelectChangeEvent<string>) => {
    setChannelAccess(e.target.value);
    if (e.target.value === 'protected') {
      setShowPasswordInput(true);
    } else {
      setShowPasswordInput(false);
    }
  };

  function handlePasswordTyping(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setPassword(e.currentTarget.value);
  }

  function sendChannel(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (channelName.substring(0, 3) === 'dm-') {
      setShowForbiddenChannelName(true);
    } else if (!channelName.length) {
      return;
    } else {
      sockContext.socketChat.emit('createChatRoom', { name: channelName, access: channelAccess, password: password, userId: me.id });
      setChannelName('');
      setPassword('');
    }
  }
  ////////////////////////////////////////////////////////////////////////////

////////////////////// SNACKBAR <CAN'T CREATE ROOM STARTING WITH 'DM-'>
const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
  if (reason === 'clickaway') {
    return;
  }
  setShowForbiddenChannelName(false);
};

const access = [
  'public',
  'protected', 
  'private',
];

  if (openForm) {
    return (
      <div>
      <form>
        {/* create new room */}
        <TextField type="text" onChange={handleNameTyping} value={channelName} placeholder="Nom Channel" />
        <FormControl>
          <InputLabel id="room-access-options">Room Access</InputLabel>
          <Select onChange={updateAccess} input={<OutlinedInput defaultValue="public" label="Access" />}>{access.map((access: string) => <MenuItem key={access} value={access}>{access}</MenuItem>)}</Select>
        </FormControl>
        {/* display password input or not (for room creation)*/}
        {showPasswordInput ? <TextField type="password" onChange={handlePasswordTyping} value={password} placeholder="Tapez votre mot de passe"/> : ''}
        {/* submit */}
        <Button type="submit" onClick={sendChannel}>
          Create a room
        </Button>
      </form>
       <Snackbar open={showForbiddenChannelName} autoHideDuration={6000} onClose={handleClose}>
       <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
         You can't create a room with a name starting with 'dm-'.
       </Alert>
     </Snackbar>
     </div>
    );
  }
  return <></>;
};
export default AddChannelForm;
