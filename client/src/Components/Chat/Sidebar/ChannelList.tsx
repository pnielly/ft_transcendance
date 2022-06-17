import { Avatar, AvatarGroup, Button, ListItem, TextField } from '@mui/material';
import AddChannelForm from './AddChannel';
import { List, ListItemText, ListItemButton } from '@mui/material';
import axios from 'axios';
import React, { useCallback, useContext, useState, Fragment, useEffect } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import Channel from '../../../Interfaces/channel.interface';
import { UserContext } from '../../../Contexts/userContext';
import User from '../../../Interfaces/user.interface';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import '../../../CSS/neon.css'
import '../../../CSS/neon-pink.css'

type Props = {
  setActiveChannel: (channel: Channel) => void;
  activeButton: string;
  friendList: User[];
};

const ChannelList = (props: Props) => {
  const { setActiveChannel, activeButton, friendList } = props;
  const [selectedChannel, setSelectedChannel] = useState<Channel | undefined>();
  const sockContext = useContext(SocketContext);
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const me = useContext(UserContext).user;
  const [banList, setBanList] = useState<User[]>([]);
  const [channelList, setChannelList] = useState<any[]>([]);
  const [showNoAccess, setShowNoAccess] = useState<boolean>(false);
  const [showWrongPassword, setShowWrongPassword] = useState<boolean>(false);

  ///// DATA UPDATE
  const updateChannelList = useCallback(() => {
    axios
      .get(`${process.env.REACT_APP_DEFAULT_URL}/channels/${me.id}/channels`, { withCredentials: true })
      .then((res) => setChannelList(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    updateChannelList();
  }, []);

  useEffect(() => {
    sockContext.socketChat.on('updateChannelList', updateChannelList);
    return () => {
      sockContext.socketChat.off('updateChannelList', updateChannelList);
    };
  }, []);

  useEffect(() => {
    sockContext.socketUser.on('updateChannelList', updateChannelList);
    return () => {
      sockContext.socketUser.off('updateChannelList', updateChannelList);
    };
  }, []);

  // BANLIST
  async function amIBanned(channel: Channel): Promise<boolean> {
    const ret = await axios.get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${channel.id}/get_banned`, { withCredentials: true });
    let res: boolean = false;
    ret.data.map((e: User) => (e.id === me.id ? (res = true) : null));
    return res;
  }

  // ENTERING CHANNEL ////////////////////////////////////////////
  async function enterChannel(channel: Channel) {
    if (await amIBanned(channel)) {
      setShowNoAccess(true);
      return;
    }
    sockContext.socketChat.emit('accessRoom', channel);
    setActiveChannel(channel);
    // add myself as a member (if i'm already one, backend will do nothing)
    sockContext.socketChat.emit('addMember', { channelId: channel.id, memberId: me.id });
  }

  // PASSWORD HANDLING ///////////////////////////////////////////////

  function verifyPassword() {
    if (selectedChannel) {
      axios
        .post(`${process.env.REACT_APP_DEFAULT_URL}/channels/${selectedChannel.id}/check_password`, { password: password }, { withCredentials: true })
        .then((res) => {
          if (res.data === true) enterChannel(selectedChannel);
          else setShowWrongPassword(true);
        })
        .catch((err) => console.log(err));
    }
    setPassword('');
  }

  function handleTyping(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setPassword(e.currentTarget.value);
  }

  ////////////// SNACKBAR <CAN'T ACCESS SINCE GOT BANNED> ////////////////
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowNoAccess(false);
  };

  type SnackProps = {
    dm: boolean;
  };

  const DisplaySnackbarAccess = (props: SnackProps) => {
    return (
      <Snackbar open={showNoAccess} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
          {"You can't access this channel anymore. You've got "}
          {props.dm ? 'blocked' : 'banned'}
          {'.'}
        </Alert>
      </Snackbar>
    );
  };

  /////////////// SNACKBAR <WRONG PASSWORD> ///////////////////////////////////
  const handleClosePassword = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowWrongPassword(false);
  };

  const DisplaySnackbarWrongPassword = () => {
    return (
      <Snackbar open={showWrongPassword} autoHideDuration={6000} onClose={handleClosePassword}>
        <Alert onClose={handleClosePassword} severity="error" sx={{ width: '100%' }}>
          {'Wrong password...'}
        </Alert>
      </Snackbar>
    );
  };

  /// DISPLAY /////////////////////////////////////////////

  // DISPLAY LISTING (EXCEPT DM) ///////////////////////////////////////////////////////////////////
  const displayListing = (e: Channel) => {
    return (
      <ListItem key={e.id}>
        <ListItemButton
          onClick={(clickEvent) => {
            // clickEvent.preventDefault();
            setShowNoAccess(false);
            amIBanned(e)
              .then((res) => {
                if (res) {
                  setShowNoAccess(true);
                  return;
                }
              })
              .catch(console.error);
            if (e.access === 'protected') {
              setShowPasswordInput(true);
              setSelectedChannel(e);
            } else {
              setShowPasswordInput(false);
              enterChannel(e);
            }
          }}
        >
          <ListItemText primary={e.name}></ListItemText>
          <ListItemText secondary={e.access}></ListItemText>
          <AvatarGroup max={3} key={'memberList'}>
            {channelList
              .find((c: any) => c.id === e.id)
              .members.map((user: User, index: number) => (
                <Avatar alt={user.username} src={user.avatar} key={index} />
              ))}
          </AvatarGroup>
        </ListItemButton>
        {/* {display password input if needed} */}
        {showPasswordInput && selectedChannel === e ? (
          <div>
            {'Please enter the password: '}
            <TextField type="password" value={password} onChange={handleTyping} />
            <Button type="submit" onClick={verifyPassword}>
              Enter
            </Button>
          </div>
        ) : (
          ''
        )}
      </ListItem>
    );
  };

  function isDirectMessageChannel(c: Channel) {
    return c.name.substring(0, 3) === 'dm-' ? true : false;
  }

  if (activeButton !== 'dm') {
    return (
      <div>
        <List>
          {/* do not display direct messaging channels (reserved for the friendList component) */}
          <h3>Owner:</h3>
          {channelList
            .filter((e) => !isDirectMessageChannel(e))
            .filter((e) => e.access === activeButton)
            .filter((e) => e.owner.id === me.id)
            .map((e) => displayListing(e))}
          <h3>Member:</h3>
          {channelList
            .filter((e) => !isDirectMessageChannel(e))
            .filter((e) => e.access === activeButton)
            .filter((e) => e.owner.id !== me.id)
            .map((e) => displayListing(e))}
        </List>
        <DisplaySnackbarAccess dm={false} />
        <DisplaySnackbarWrongPassword />
      </div>
    );
  }

  // DM return ///////////////////////////////////////////////////////////////////////////////////
  // DISPLAY LISTING FOR DM
  const displayListingDM = (e: Channel) => {
    const user = channelList.find((c: Channel) => c.id === e.id).members.find((u: User) => u.id !== me.id);
    return (
      <ListItem key={e.id}>
        <ListItemButton onClick={() => enterChannel(e)}>
          <ListItemText primary={user.username}></ListItemText>
          <Avatar alt={user.username} src={user.avatar} key={user.id} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <div>
      <List>{channelList.filter((e: Channel) => isDirectMessageChannel(e)).map((e) => displayListingDM(e))}</List>
      <DisplaySnackbarAccess dm={true} />
    </div>
  );
};

export default ChannelList;
