import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Button, Stack, TextField, Grid, Container } from '@mui/material';
import axios from 'axios';
import { UserContext } from '../Contexts/userContext';
import { SocketContext } from '../Contexts/socket';
import User from '../Interfaces/user.interface';
import Autocomplete from '@mui/material/Autocomplete';
import UserList from '../Components/Users/SideBar/userList';
import UserMainBox from '../Components/Users/userMainBox';
import { useLocation } from 'react-router-dom';
import Channel from '../Interfaces/channel.interface';

type Props = {
  activeChannel: Channel | undefined;
};

const api = {
  getUsers: () => {
    return axios.get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/users`, { withCredentials: true });
  },

  getFriends: (id: string) => {
    return axios.get(`${process.env.REACT_APP_DEFAULT_URL}/users/${id}/get_friends`, { withCredentials: true });
  },

  getBlocked: (id: string) => {
    return axios.get(`${process.env.REACT_APP_DEFAULT_URL}/users/${id}/get_blocked`, { withCredentials: true });
  }
};

const Users = (props: Props) => {
  const { activeChannel } = props;
  let { state } = useLocation();
  const [activeButton, setActiveButton] = useState<string>('all');
  const me = useContext(UserContext).user;
  const sockContext = useContext(SocketContext);
  const [userList, setUserList] = useState<User[]>([]);
  const [friendList, setFriendList] = useState<User[]>([]);
  const [blockList, setBlockList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(state as User);

  const updateUsers = () => {
    api
      .getUsers()
      .then((res) => setUserList(res.data))
      .catch((err) => console.log(err));
  };

  const updateFriends = () => {
    if (me.id) {
      api
        .getFriends(me.id)
        .then((res) => setFriendList(res.data))
        .catch((err) => console.log(err));
    }
  };

  const updateBlocked = () => {
    if (me.id) {
      api
        .getBlocked(me.id)
        .then((res) => setBlockList(res.data))
        .catch((err) => console.log(err));
    }
  };
  // update userList, blockList, friendList from start
  useEffect(() => {
    updateUsers();
    updateFriends();
    updateBlocked();
  }, []);

  // join own channel where all personnal requests will be received (invitations to join games, channels, friend requests)
  useEffect(() => {
    sockContext.socketUser.emit('online', me.id);
  }, [sockContext.socketUser, me.id]);

  useEffect(() => {
    setSelectedUser(state as User);
  }, [state]);

  // update userList on change
  useEffect(() => {
    sockContext.socketUser.on('updateUserList', updateUsers);
    return () => {
      sockContext.socketUser.off('updateUserList', updateUsers);
    };
  }, []);

  // update FriendList on change
  useEffect(() => {
    sockContext.socketUser.on('updateFriendList', updateFriends);
    return () => {
      sockContext.socketUser.off('updateFriendList', updateFriends);
    };
  }, []);

  // update blockList on change
  useEffect(() => {
    sockContext.socketUser.on('updateBlockList', updateBlocked);
    return () => {
      sockContext.socketUser.off('updateBlockList', updateBlocked);
    };
  }, []);

  // MISE EN PAGE ////////////////////////////////////////////////////////

  const handleActiveButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const button: HTMLButtonElement = event.currentTarget;
    setActiveButton(button.value);
  };

  const NavButton = (props: { name: string }) => (
    <Button className='neon-pink' variant={isActive(props.name)} sx={{ width: '100%' }} onClick={handleActiveButton} value={props.name}>
      {props.name}
    </Button>
  );

  const isActive = (value: string): 'contained' | 'outlined' => {
    if (value === activeButton) return 'contained';
    return 'outlined';
  };

  ////////////////////////////////////////////////////////

  const usernameList = Array.from(userList, (u: User) => u.username);
  const [value, setValue] = useState<string>();
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

  const findAndOpenChannel = () => {
    if (name) {
      let user1: User | undefined = selectedUser;
      userList.map((c: User) => (c.username === name ? (user1 = c) : null));
      if (user1) setSelectedUser(user1);
    } else if (value) {
      let user: User | undefined = selectedUser;
      userList.map((c: User) => (c.username === value ? (user = c) : null));
      if (user) setSelectedUser(user);
    }
  };

  return (
    <Container maxWidth="xl">
      <Grid container sx={{ width: '100%', height: '100vh' }}>
        <Grid item md={3} sx={{ borderRight: '1px solid #e0e0e0' }}>
          <Grid item xs={12} sx={{ padding: '10px' }}>
            <Autocomplete
              disablePortal
              id="UserList"
              options={usernameList}
              sx={{ width: 300 }}
              onChange={(event, value) => handleChange(value)}
              renderInput={(params) => <TextField {...params} label="User" onChange={handleInput} />}
              onKeyPress={(e) => {
                if (e.key === 'Enter') findAndOpenChannel();
              }}
            />
          </Grid>
          <Stack spacing={1} direction="row" justifyContent="space-around" sx={{ padding: '10px', flex: 1 / 3 }} flex={1 / 3}>
            <NavButton name="all" />
            <NavButton name="friends" />
            <NavButton name="blocked" />
          </Stack>
          <UserList activeButton={activeButton} friendList={friendList} blockList={blockList} userList={userList} setSelectedUser={setSelectedUser} />
        </Grid>
        <Grid item md={9} xs={12} sx={{ backgroundColor: 'rgb(35,35,35)' }}>
          {selectedUser ? <UserMainBox selectedUser={selectedUser} myBlockList={blockList} myFriendList={friendList} activeChannel={activeChannel} /> : <></>}
        </Grid>
      </Grid>
    </Container>
  );
};
export default Users;
