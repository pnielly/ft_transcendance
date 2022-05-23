import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import User from '../Interfaces/user.interface';
import { ListItemButton } from '@mui/material';
import { UserContext } from '../../Contexts/userContext';

const UserList = () => {
  const [userList, setUserList] = useState<User[] | []>([]);
  const me = useContext(UserContext).user;
  const [selectedUser, setSelectedUser] = useState<User>();

  // Display users /////////////////////////////
  useEffect(() => {
    axios
      .get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/users`)
      .then((res) => {
        setUserList(res.data);
      })
      .catch((err) => console.log(err));
  }, [userList]);

  // Send friend Requests /////////////////////////
  const sendFriendRequest = (e: React.MouseEvent<HTMLButtonElement>) => {
    axios
      .post(`${process.env.REACT_APP_DEFAULT_URL}/users/${e.currentTarget.value}/add_friend_request`, { fromId: me.id })
      .then((res) => console.log('friend request sent'))
      .catch((err) => console.log(err));
  };

  return (
    <List>
      {userList.map((u: User) => (
        <ListItemButton key={u.id} onClick={() => setSelectedUser(u)}>
          {u.id !== me.id && selectedUser?.id === u.id ? (
            <div>
              <button onClick={sendFriendRequest} value={u.id}>
                {'Add '}
                {u.username}
                {' as a friend ?'}
              </button>
            </div>
          ) : (
            ''
          )}
          <ListItemIcon>
            <Avatar alt={u.username} src={u.avatar} />
          </ListItemIcon>
          <ListItemText primary={u.username}>{u.username}</ListItemText>
          <ListItemText secondary="offline"></ListItemText>
        </ListItemButton>
      ))}
    </List>
  );
};

export default UserList;
