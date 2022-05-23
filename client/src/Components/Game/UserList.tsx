import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import User from '../Interfaces/user.interface';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SocketContext } from '../../Contexts/socket';
import { Button, Grid } from '@mui/material';
import { UserContext } from '../../Contexts/userContext';

const UserList = () => {
  const [users, setUsers] = useState<User[] | []>([]);
  const [usersStatus, setUsersStatus] = useState<{ [userId: number]: string }>({});
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;

  useEffect(() => {
    axios
      .get<User[]>(
        `${process.env.REACT_APP_DEFAULT_URL}/users
      `
      )
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  function updateStatusUser(data: { [userId: number]: string }) {
    console.log(data);
    setUsersStatus(data);
  }

  useEffect(() => {
    sockContext.socketPong.on('statusOfUsers', updateStatusUser);
  }, [sockContext.socketPong]);

  function getStatusOfUser(userId: number) {
    const status = usersStatus[userId];
    if (status) return status;
    return 'offline';
  }

  function inviteUserToPong(e: React.MouseEvent<HTMLButtonElement>) {
    const guestId = e.currentTarget.value;
    sockContext.socketPong.emit('gameInvitation', { sender: me, guestId: guestId });
  }

  function handleWatchGame(e: React.MouseEvent<HTMLButtonElement>, userId: number) {
    sockContext.socketPong.emit('watchGame', userId);
  }

  const OptionsUser = (props: { status: string; id: number }) => {
    if (props.status == 'online')
      return (
        <Button color="secondary" variant="contained" onClick={inviteUserToPong} value={props.id}>
          {' '}
          Invite Game
        </Button>
      );
    else if (props.status == 'ingame')
      return (
        <Button color="secondary" variant="contained" onClick={(e) => handleWatchGame(e, props.id)} value={props.id}>
          Watch Game
        </Button>
      );
    else return <></>;
  };

  // Listen For pending Invitation

  return (
    <Grid container sx={{ width: '100%' }}>
      <Grid item xs={6}>
        <List>
          {users.map(({ username, id, avatar }) => (
            <ListItem key={id} alignItems="flex-start">
              <ListItemIcon>
                <Avatar alt={username} src={avatar} />
              </ListItemIcon>
              <ListItemText primary={username}>{username}</ListItemText>
              <ListItemText secondary={getStatusOfUser(id)}></ListItemText>
              <OptionsUser status={getStatusOfUser(id)} id={id} />
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
};

export default UserList;
