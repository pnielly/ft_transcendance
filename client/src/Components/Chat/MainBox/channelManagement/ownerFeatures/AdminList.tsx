import React, { useState, useContext } from 'react';
import { SocketContext } from '../../../../../Contexts/socket';
import { UserContext } from '../../../../../Contexts/userContext';
import Channel from '../../../../../Interfaces/channel.interface';
import User from '../../../../../Interfaces/user.interface';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import { ListItemButton, Button } from '@mui/material';

type Props = {
  activeChannel: Channel;
  adminList: User[];
};

const AdminList = (props: Props) => {
  const { adminList, activeChannel } = props;
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;
  const [selectedUser, setSelectedUser] = useState<User>();

  // REMOVE ADMIN
  const removeAdmin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    sockContext.socketChat.emit('unAdmin', { channelId: activeChannel.id, adminId: e.currentTarget.value });
  };

  return (
    <div>
      <List>
        {adminList.map((u: User) => (
          <ListItemButton key={u.id} onClick={() => setSelectedUser(u)}>
            {u.id !== me.id && activeChannel.owner.id === me.id && selectedUser?.id === u.id ? (
              <div>
                <Button onClick={removeAdmin} value={u.id}>
                  {'remove'}
                </Button>
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
    </div>
  );
};

export default AdminList;
