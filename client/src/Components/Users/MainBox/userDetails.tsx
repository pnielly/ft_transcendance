import { Avatar, Grid, Button, ButtonGroup, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import { SocketContext } from '../../../Contexts/socket';
import { UserContext } from '../../../Contexts/userContext';
import User from '../../../Interfaces/user.interface';
import Channel from '../../../Interfaces/channel.interface';
import { useNavigate } from 'react-router-dom';
import PongInviteDialog from './PongInviteDialog';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import BlockIcon from '@mui/icons-material/Block';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ChatIcon from '@mui/icons-material/Chat';
/*
  User Details: 
  - Avatar
  - Username
  - Rank
  - Win 
  - Defeat
*/

interface Stats {
  win: number;
  defeat: number;
  rank: number;
  points: number;
}

type Props = {
  selectedUser: User | undefined;
  myBlockList: User[];
  myFriendList: User[];
  activeChannel: Channel | undefined;
};

const UserDetails = (props: Props) => {
  const { selectedUser, myBlockList, myFriendList, activeChannel } = props;
  const [stats, setStats] = useState<Stats | undefined>();
  const sockContext = useContext(SocketContext);
  const [blockList, setBlockList] = useState<User[]>();
  const me = useContext(UserContext).user;
  const [channelList, setChannelList] = useState<Channel[]>([]);
  let navigate = useNavigate();
  const [openPongOptions, setOpenPongOptions] = useState<boolean>(false);
  const [option, setOption] = useState<string>('normal');
  const [inviteSent, setInviteSent] = useState<boolean>(false);
  const [showBlocked, setShowBlocked] = useState<boolean>(false);

  /////////////////////////////////// FRIEND REQUEST //////////////////////////////////////////////////////////////////////////////////////////:

  const updateBlockList = () => {
    if (selectedUser) {
      axios
        .get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/users/${selectedUser.id}/get_blocked`, { withCredentials: true })
        .then((res) => setBlockList(res.data))
        .catch((err) => console.log(err));
    }
  };

  useEffect(() => {
    updateBlockList();
  }, [selectedUser]);

  function isBlocked(user: User) {
    let bol: boolean = false;
    blockList?.map((e: User) => (e.id === user.id ? (bol = true) : null));
    return bol;
  }

  // Send friend Requests /////////////////////////
  const sendFriendRequest = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('sending invite frind')
    if (isBlocked(me)) setShowBlocked(true);
    else {
      sockContext.socketUser.emit('friendRequestSent', { fromId: me.id, toId: selectedUser?.id });
      setInviteSent(true);
    }
  };

  function unfriend(e: React.MouseEvent<HTMLButtonElement>) {
    sockContext.socketUser.emit('unfriend', { fromId: me.id, toId: selectedUser?.id });
  }

  // Send game invite ////////////////////////////////
  function sendGameInvite(e: React.MouseEvent<HTMLButtonElement>) {
    setOpenPongOptions(false);
    if (isBlocked(me)) setShowBlocked(true);
    else {
      if (option === 'normal') sockContext.socketPong.emit('gameInvitation', { sender: me, guestId: selectedUser?.id, options: { doubleBall: false, paddle: false } });
      else if (option === 'doubleBall') sockContext.socketPong.emit('gameInvitation', { sender: me, guestId: selectedUser?.id, options: { doubleBall: true, paddle: false } });
      else if (option === 'paddle') sockContext.socketPong.emit('gameInvitation', { sender: me, guestId: selectedUser?.id, options: { doubleBall: false, paddle: true } });
      setInviteSent(true);
    }
  }

  const blockUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    sockContext.socketUser.emit('blockUser', { fromId: me.id, blockId: selectedUser?.id });
  };

  const unblockUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    sockContext.socketUser.emit('unblockUser', { fromId: me.id, blockId: selectedUser?.id });
  };

  // private channel name builder
  function privateChannelName(id_a: string, id_b: string): string {
    if (id_a < id_b) return 'dm-' + id_a + id_b;
    else return 'dm-' + id_b + id_a;
  }

  // update channelList
  const updateChannelList = useCallback(() => {
    axios
      .get<Channel[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${me.id}/channels`, { withCredentials: true })
      .then((res) => setChannelList(res.data))
      .catch((err) => console.log(err));
  }, [me]);

  // update ChannelList from start
  useEffect(() => {
    updateChannelList();
  }, []);

  // update ChannelList on change
  useEffect(() => {
    sockContext.socketUser.on('updateChannelList', updateChannelList);
    return () => {
      sockContext.socketUser.off('updateChannelList', updateChannelList);
    };
  }, [activeChannel]);

  // handle private message
  function privateMessage(e: React.MouseEvent<HTMLButtonElement>) {
    if (isBlocked(me)) setShowBlocked(true);
    else if (selectedUser) {
      const channel: Channel | undefined = channelList.find((r) => r.name === privateChannelName(selectedUser.id, me.id));
      if (channel) {
        sockContext.socketChat.emit('accessRoom', channel);
        navigate('/chat', { state: channel });
      } else alert('channel not found...');
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    axios
      .get<Stats>(`${process.env.REACT_APP_DEFAULT_URL}/ranking/stats/${selectedUser?.id}`, { withCredentials: true })
      .then((res) => setStats(res.data))
      .catch((err) => setStats(undefined));
  }, [selectedUser]);

  // Snackbar <invite has been sent>
  const handleCloseInvite = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setInviteSent(false);
  };

  // SnackBar <this user blocked you>
  const handleCloseBlocked = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowBlocked(false);
  };

  return (
    <Grid container direction="column" alignItems="center" spacing={1} sx={{ borderRadius: '20px', backgroundColor: 'rgb(28, 26, 26)', maxWidth: '350px', maxHeight: '400px', marginTop: '40px' }}>
      <Grid item sx={{ marginTop: '20px' }}>
        <Avatar src={selectedUser?.avatar} alt={`img of ${selectedUser?.username}`} sx={{ width: '100px', height: '100px' }} />
      </Grid>
      <Grid item>
        <Typography variant="h6">{selectedUser?.username}</Typography>
      </Grid>
      {stats ? (
        <React.Fragment>
          <Grid item>
            <Typography variant="h6" sx={{ display: 'inline' }}>{`Elo: ${stats?.points}`}</Typography>
            <EmojiEventsIcon />
          </Grid>
          <Grid item>
            <Typography variant="h6" sx={{ display: 'inline' }}>{`Win: ${stats?.win}`}</Typography>
            <CallMadeIcon />
          </Grid>
          <Grid item>
            <Typography variant="h6" sx={{ display: 'inline' }}>{`Defeat: ${stats?.defeat}`}</Typography>
            <CallReceivedIcon />
          </Grid>
        </React.Fragment>
      ) : (
        <Typography variant="h6">No Stats available yet</Typography>
      )}
      <Grid item sx={{ margin: '10px 0 10px 0' }}>
        {selectedUser?.id === me.id ? (
          ''
        ) : (
          <Grid container justifyContent="center" alignItems="center">
            <ButtonGroup size="medium" aria-label="small button group" sx={{ bgcolor: 'background.paper', marginRight: '10px' }}>
              {myFriendList.find((u: User) => u.id === selectedUser?.id) ? (
                <React.Fragment>
                  <Button key="unfriend" onClick={unfriend}>
                    <PersonRemoveIcon />
                    <span style={{ marginLeft: '5px' }}>Unfriend</span>
                  </Button>
                  <Button key="DM" onClick={privateMessage}>
                    <ChatIcon />
                    <span style={{ marginLeft: '5px' }}>Chat</span>
                  </Button>
                </React.Fragment>
              ) : (
                <Button key="friend" onClick={sendFriendRequest}>
                  <GroupAddIcon />
                  <span style={{ marginLeft: '5px' }}>Befriend</span>
                </Button>
              )}
              <Button key="invite" onClick={() => setOpenPongOptions(!openPongOptions)}>
                <SportsEsportsIcon />
                <span style={{ marginLeft: '5px' }}>Play</span>
              </Button>
              <PongInviteDialog open={openPongOptions} setOpen={setOpenPongOptions} sendGameInvite={sendGameInvite} option={option} setOption={setOption} />
            </ButtonGroup>
            {myBlockList.find((u: User) => u.id === selectedUser?.id) ? (
              <Button key="unblock" onClick={unblockUser}>
                Unblock
              </Button>
            ) : (
              <Button key="block" onClick={blockUser} color="error">
                <BlockIcon />
                Block
              </Button>
            )}
          </Grid>
        )}
      </Grid>
      <Snackbar open={inviteSent} autoHideDuration={6000} onClose={handleCloseInvite}>
        <Alert onClose={handleCloseInvite} severity="info" sx={{ width: '100%' }}>
          An invite has been sent.
        </Alert>
      </Snackbar>
      <Snackbar open={showBlocked} autoHideDuration={6000} onClose={handleCloseBlocked}>
        <Alert onClose={handleCloseBlocked} severity="error" sx={{ width: '100%' }}>
          Request declined: This user blocked you.
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default UserDetails;
