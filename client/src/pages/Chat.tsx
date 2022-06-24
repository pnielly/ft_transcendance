import React, { useState, useEffect, useContext, useCallback } from 'react';
import ChannelList from '../Components/Chat/Sidebar/ChannelList';
import { Button, Stack, Divider, TextField, Grid, Paper, Container } from '@mui/material';
import axios from 'axios';
import Channel from '../Interfaces/channel.interface';
import Message from '../Interfaces/message.interface';
import { UserContext } from '../Contexts/userContext';
import { SocketContext } from '../Contexts/socket';
import User from '../Interfaces/user.interface';
import Autocomplete from '@mui/material/Autocomplete';
import AddChannelForm from '../Components/Chat/Sidebar/AddChannel';
import ChannelMainBox from '../Components/Chat/MainBox/ChannelMainBox';
import { useLocation } from 'react-router-dom';
import '../CSS/neon.css'
import '../CSS/neon-pink.css'

type Props = {
  activeChannel: Channel | undefined;
  setActiveChannel: (channel: Channel | undefined) => void;
};

const api = {
  getFriends: (id: string) => {
    return axios.get(`${process.env.REACT_APP_DEFAULT_URL}/users/${id}/get_friends`, { withCredentials: true });
  },
  getChannels: (id: string) => {
    return axios.get<Channel[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${id}/channels`, { withCredentials: true });
  },
  getMessages: (id: string) => {
    return axios.get<Message[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${id}/messages`, { withCredentials: true });
  },
  getMembers: (id: string) => {
    return axios.get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${id}/get_members`, { withCredentials: true });
  },
  getAdmins: (id: string) => {
    return axios.get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${id}/get_admins`, { withCredentials: true });
  },
  getBanned: (id: string) => {
    return axios.get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${id}/get_banned`, { withCredentials: true });
  },
  getMuted: (id: string) => {
    return axios.get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${id}/get_muted`, { withCredentials: true });
  },
  getUsers: () => {
    return axios.get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/users`, { withCredentials: true });
  }
};

const Chat = (props: Props) => {
  const { state } = useLocation();
  const { activeChannel, setActiveChannel } = props;
  const [activeButton, setActiveButton] = useState<string>('public');
  const [channelList, setChannelList] = useState<Channel[]>([]);
  const [messageList, setMessageList] = useState<Message[]>([]);
  const me = useContext(UserContext).user;
  const sockContext = useContext(SocketContext);
  const [adminList, setAdminList] = useState<User[]>([]);
  const [memberList, setMemberList] = useState<User[]>([]);
  const [banList, setBanList] = useState<User[]>([]);
  const [muteList, setMuteList] = useState<User[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [friendList, setFriendList] = useState<User[]>([]);

  // join own channel where all personnal requests will be received (invitations to join games, channels, friend requests)
  useEffect(() => {
    sockContext.socketChat.emit('online', me.id);
    sockContext.socketUser.emit('online', me.id);
  }, [sockContext.socketChat, me.id]);

  // set activeChannel as state (if coming from "discuss" button from userDetails component)
  useEffect(() => {
    setActiveChannel(state as Channel);
  }, []);

  // UPDATING MESSAGE, CHANNEL, ADMIN, BANNED, MEMBER, MUTE, BLOCK AND USER LISTS /////////////////////////////////////////////////
  const updateFriends = () => {
    if (me.id) {
      api
        .getFriends(me.id)
        .then((res) => setFriendList(res.data))
        .catch((err) => console.log(err));
    }
  };

  const updateChannels = () => {
    if (me.id) {
      api
        .getChannels(me.id)
        .then((res) => setChannelList(res.data))
        .catch((err) => console.log(err));
    }
  };

  const updateMessages = () => {
    console.log('updateMessage')
    if (activeChannel?.id) {
      api
        .getMessages(activeChannel.id)
        .then((res) => setMessageList(res.data))
        .catch((err) => console.log(err));
    }
  };

  const updateMembers = () => {
    if (activeChannel?.id) {
      api
        .getMembers(activeChannel.id)
        .then((res) => setMemberList(res.data))
        .catch((err) => console.log(err));
    }
  };

  const updateAdmins = () => {
    if (activeChannel?.id) {
      api
        .getAdmins(activeChannel.id)
        .then((res) => {
          setAdminList(res.data);
        })
        .catch((err) => console.log(err));
    }
  };

  const updateBans = () => {
    if (activeChannel?.id) {
      api
        .getBanned(activeChannel.id)
        .then((res) => {
          setBanList(res.data);
          // if user banned and in the channel --> ejected from the channel
          res.data.map((u: User) => (u.id === me.id ? setActiveChannel(undefined) : null));
        })
        .catch(console.error);
    }
  };

  const updateMutes = () => {
    if (activeChannel?.id) {
      api
        .getMuted(activeChannel.id)
        .then((res) => setMuteList(res.data))
        .catch((err) => console.log(err));
    }
  };

  const updateUsers = () => {
    api
      .getUsers()
      .then((res) => setUserList(res.data))
      .catch((err) => console.log(err));
  };

  // // update adminList, memberList, banList, muteList, userList, blockList, friendList and friendRequestList from start
  useEffect(() => {
    updateUsers();
    updateAdmins();
    updateMessages();
    updateMembers();
    updateBans();
    updateMutes();
    updateChannels();
  }, [activeChannel]);

  // update FriendList on change
  useEffect(() => {
    sockContext.socketChat.on('updateFriendList', updateFriends);
    return () => {
      sockContext.socketChat.off('updateFriendList', updateFriends);
    };
  }, []);

  // update memberList when back end emit
  useEffect(() => {
    sockContext.socketChat.on('updateMemberList', updateMembers);
    // Note: without following lines, updateMemberList will update with each previous activeChannel selected each time.
    return () => {
      sockContext.socketChat.off('updateMemberList', updateMembers);
    };
  }, [activeChannel]);

  // update adminList when back end emit
  useEffect(() => {
    sockContext.socketChat.on('updateAdminList', updateAdmins);
    return () => {
      sockContext.socketChat.off('updateAdminList', updateAdmins);
    };
  }, [activeChannel]);

  // update banList when back End Emit
  useEffect(() => {
    sockContext.socketChat.on('updateBanList', updateBans);
    return () => {
      sockContext.socketChat.off('updateBanList', updateBans);
    };
  }, [activeChannel]);

  // update muteList when Back End emit
  useEffect(() => {
    sockContext.socketChat.on('updateMuteList', updateMutes);
    return () => {
      sockContext.socketChat.off('updateMuteList', updateMutes);
    };
  }, [activeChannel]);

  // update userList when Back End Emit
  useEffect(() => {
    sockContext.socketChat.on('updateUserList', updateUsers);
    return () => {
      sockContext.socketChat.off('updateUserList', updateUsers);
    };
  }, [activeChannel]);

  // update ChannelList on change
  useEffect(() => {
    sockContext.socketChat.on('updateChannelList', updateChannels);
    sockContext.socketUser.on('updateChannelList', updateChannels);
    return () => {
      sockContext.socketChat.off('updateChannelList', updateChannels);
      sockContext.socketUser.off('updateChannelList', updateChannels);
    };
  }, [activeChannel]);

  // update MessageList on change
  useEffect(() => {
    console.log('activeChannel', activeChannel)
    sockContext.socketChat.on('updateMessageList', updateMessages);
    return () => {
      sockContext.socketChat.off('updateMessageList', updateMessages);
    };
  }, [activeChannel]);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function channelExists(channel: Channel) {
    let bol: boolean = false;
    channelList.map((c: Channel) => (c.id === channel.id ? (bol = true) : ''));
    return bol;
  }

  // eject members if room doesn't exist anymore
  useEffect(() => {
    if (activeChannel && !channelExists(activeChannel)) {
      setActiveChannel(undefined);
    }
  }, [channelList]);

  // eject member if in the direct message channel with a user who just blocked him
  const gotBlocked = (fromId: string) => {
    let bol: boolean = false;
    memberList.map((u: User) => (u.id === fromId ? (bol = true) : null));
    if (activeChannel?.name.substring(0, 3) === 'dm-' && bol) {
      setActiveChannel(undefined);
    }
  };

  useEffect(() => {
    sockContext.socketChat.on('gotBlocked', gotBlocked);
  }, [activeChannel]);

  // MISE EN PAGE ////////////////////////////////////////////////////////

  const handleActiveButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const button: HTMLButtonElement = event.currentTarget;
    setActiveButton(button.value);
  };

  const NavButton = (props: { name: string; value: string }) => (
    <Button className='neon' variant={isActive(props.value)} sx={{ width: '100%' }} onClick={handleActiveButton} value={props.value}>
      {props.name}
    </Button>
  );

  const isActive = (value: string): 'contained' | 'outlined' => {
    if (value === activeButton) return 'contained';
    return 'outlined';
  };

  function isDirectMessageChannel(c: Channel) {
    return c.name.substring(0, 3) === 'dm-' ? true : false;
  }

  ////////////////////////// INPUT DIRECT ACCESS  //////////////////////////////

  const channelNameList = Array.from(
    channelList.filter((c: Channel) => !isDirectMessageChannel(c)),
    (u: Channel) => u.name
  );

  const [value, setValue] = useState<string>('');
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [name, setName] = useState<string>('');

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

  // name is result of list selection | value is the result of typing
  const findAndOpenChannel = () => {
    if (name) {
      let chan1: Channel | undefined = activeChannel;
      channelList.map((c: Channel) => (c.name === name ? (chan1 = c) : null));
      if (chan1) setActiveChannel(chan1);
    } else if (value) {
      let chan: Channel | undefined = activeChannel;
      channelList.map((c: Channel) => (c.name === value ? (chan = c) : null));
      if (chan) setActiveChannel(chan);
    }
  };

  //// OPEN CREATE CHANNEL FORM
  function handleOpening(e: React.MouseEvent<HTMLButtonElement>) {
    setOpenForm(!openForm);
  }
  
  return (
    <Container maxWidth="xl">
      <Grid container component={Paper} sx={{ width: '100%', height: '90vh' }} justifyContent="center">
        <Grid item md={3} xs={12} sx={{ borderRight: '1px solid #e0e0e0' }}>
          <Grid item xs={12} sx={{ padding: '10px' }}>
            <Autocomplete
              disablePortal
              id="ChannelList"
              options={channelNameList}
              sx={{ width: 300 }}
              onChange={(event, value) => handleChange(value)}
              renderInput={(params) => <TextField {...params} label="Channel" onChange={handleInput} />}
              onKeyPress={(e) => {
                if (e.key === 'Enter') findAndOpenChannel();
              }}
            />
          </Grid>
          <Divider />
          <Button className='ranking-glow neon-pink' variant="outlined" color="secondary" sx={{ margin: '10px' }} onClick={handleOpening}>
            Create channel
          </Button>
          <AddChannelForm openForm={openForm} />
          <Stack spacing={1} direction="row" justifyContent="space-around" sx={{ padding: '10px', flex: 1 / 3 }} flex={1 / 3}>
            <NavButton name="public" value="public" />
            <NavButton name="protect" value="protected" />
            <NavButton name="private" value="private" />
            <NavButton name="DM" value="dm" />
          </Stack>
          <Divider />
          <ChannelList activeButton={activeButton} setActiveChannel={setActiveChannel} friendList={friendList} />
        </Grid>
        <Grid item md={9} xs={12} sx={{ backgroundColor: 'rgb(35,35,35)' }}>
          {activeChannel ? (
            <ChannelMainBox
              activeChannel={activeChannel}
              setActiveChannel={setActiveChannel}
              adminList={adminList}
              memberList={memberList}
              banList={banList}
              muteList={muteList}
              userList={userList}
              messageList={messageList}
              isDirectMessageChannel={isDirectMessageChannel}
            />
          ) : (
            ''
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Chat;
