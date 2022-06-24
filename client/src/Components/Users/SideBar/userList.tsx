import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useContext, useState, useEffect } from 'react';
import User from '../../../Interfaces/user.interface';
import Avatar from '@mui/material/Avatar';
import { SocketContext } from '../../../Contexts/socket';
import { UserContext } from '../../../Contexts/userContext';
import { ListItemButton } from '@mui/material';

type Props = {
  activeButton: string;
  userList: User[];
  friendList: User[];
  blockList: User[];
  setSelectedUser: (user: User) => void;
};

const UserList = (props: Props) => {
  const { userList, activeButton, blockList, friendList, setSelectedUser } = props;
  const me = useContext(UserContext).user;
  const sockContext = useContext(SocketContext);
  const [usersStatus, setUsersStatus] = useState<{ [userId: string]: string }>({});

  // SAY HELLOW I AM LOGIN
  useEffect(() => {
    sockContext.socketPong.emit('online', me.id);
  }, []);

  //////////////// GAME ///////////////////////////////////////////////////////////////

  function updateStatusUser(data: { [userId: string]: string }) {
    setUsersStatus(data);
  }

  useEffect(() => {
    sockContext.socketPong.on('statusOfUsers', updateStatusUser);
  }, []);

  function getStatusOfUser(userId: string) {
    const status = usersStatus[userId];
    if (status) return status;
    return 'offline';
  }

  function isRelevant(user: User) {
    if (activeButton === 'blocked') {
      return blockList.find((u) => u.id === user.id) ? true : false;
    } else if (activeButton === 'friends') {
      return friendList.find((u) => u.id === user.id) ? true : false;
    } else {
      return true;
    }
  }

  // DISPLAY LISTING
  const displayListing = (u: User) => {
    return (
      <React.Fragment key={u.id}>
        <ListItemButton key={u.id} onClick={() => setSelectedUser(u)}>
          <ListItemIcon>
            <Avatar alt={u.username} src={u.avatar} />
          </ListItemIcon>
          <ListItemText primary={u.username}>{u.username}</ListItemText>
          <ListItemText secondary={getStatusOfUser(u.id)}></ListItemText>
        </ListItemButton>
      </React.Fragment>
    );
  };

  return (
    <div>
      {' '}
      <List>{userList.filter((e: User) => isRelevant(e)).map((e) => displayListing(e))}</List>
    </div>
  );
};

export default UserList;
