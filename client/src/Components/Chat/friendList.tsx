import { Avatar, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../Contexts/socket';
import { UserContext } from '../../Contexts/userContext';
import Channel from '../Interfaces/channel.interface';
import User from '../Interfaces/user.interface';

type Props = {
  channelList: Channel[];
  setActiveChannel: (channel: Channel) => void;
};

const FriendList = (props: Props) => {
  const { channelList, setActiveChannel } = props;
  const sockContext = useContext(SocketContext);
  const [friendRequestList, setFriendRequestList] = useState<User[]>([]);
  const [showRequest, setShowRequest] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const me = useContext(UserContext).user;
  const [friendList, setFriendList] = useState<User[]>([]);

  // private channel name builder
  function privateChannelName(id_a: number, id_b: number): string {
    if (id_a < id_b) return 'dm-' + String(id_a) + String(id_b);
    else return 'dm-' + String(id_b) + String(id_a);
  }

  const updateFriendRequestList = useCallback(() => {
    axios
      .get(`${process.env.REACT_APP_DEFAULT_URL}/users/${me.id}/get_friend_requests`)
      .then((res) => setFriendRequestList(res.data))
      .catch((err) => console.log(err));
  }, [me.id]);

  const updateFriendList = useCallback(() => {
    axios
      .get(`${process.env.REACT_APP_DEFAULT_URL}/users/${me.id}/get_friends`)
      .then((res) => setFriendList(res.data))
      .catch((err) => console.log(err));
  }, [me.id]);

  // update from start
  useEffect(() => {
    updateFriendRequestList();
    updateFriendList();
  }, [updateFriendList, updateFriendRequestList]);

  // RECEIVER :  Accept or Decline ///////////////////////////
  const accept = (e: React.MouseEvent<HTMLButtonElement>) => {
    sockContext.socketChat.emit('friendRequestAccepted', { name: privateChannelName(me.id, Number(e.currentTarget.value)), fromId: me.id, toId: Number(e.currentTarget.value) });
    addFriendInDB(e.currentTarget.value);
    updateFriendList();

    axios
      .delete(`${process.env.REACT_APP_DEFAULT_URL}/users/${me.id}/remove_friend_request`, { data: { fromId: e.currentTarget.value } })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
    updateFriendRequestList();
  };

  const decline = (e: React.MouseEvent<HTMLButtonElement>) => {
    axios
      .delete(`${process.env.REACT_APP_DEFAULT_URL}/users/${me.id}/remove_friend_request`, { data: { fromId: e.currentTarget.value } })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
    updateFriendRequestList();
  };

  const addFriendInDB = useCallback(
    (friendId: string) => {
      axios
        .post(`${process.env.REACT_APP_DEFAULT_URL}/users/${me.id}/add_friend`, { friendId: friendId })
        .then((res) => {
          console.log('friend added !');
        })
        .catch((err) => console.log(err));
    },
    [me.id]
  );

  // SENDER : Friend request has been accepted, joining dedicated private channel, add friend in db
  const joinNewFriendChannel = useCallback(
    (param: { name: string; fromId: number; toId: number }) => {
      sockContext.socketChat.emit('joinNewFriendChannel', param.name);
      addFriendInDB(String(param.fromId));
      updateFriendList();
      // create a private channel between the two users
      sockContext.socketChat.emit('createChatRoom', { name: param.name, access: 'private', password: '', owner: {} });
    },
    [sockContext.socketChat, updateFriendList, addFriendInDB]
  );

  useEffect(() => {
    sockContext.socketChat.on('newFriend', joinNewFriendChannel);
  }, [sockContext.socketChat, joinNewFriendChannel]);

  //////////////////////////////////////////////////////////////////////

  // handle private message
  function privateMessage(e: React.MouseEvent<HTMLButtonElement>) {
    const channel: Channel | undefined = channelList.find((r) => String(r.name) === privateChannelName(Number(e.currentTarget.value), me.id));
    if (channel) {
      sockContext.socketChat.emit('accessRoom', channel);
      setActiveChannel(channel);
    } else alert('channel not found...');
  }

  // handle unfriend
  function unfriend(e: React.MouseEvent<HTMLButtonElement>) {
    // remove friend from my side
    axios
      .delete(`${process.env.REACT_APP_DEFAULT_URL}/users/${me.id}/remove_friend`, { data: { friendId: e.currentTarget.value } })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
    // remove myself from friend side
    axios
      .delete(`${process.env.REACT_APP_DEFAULT_URL}/users/${e.currentTarget.value}/remove_friend`, { data: { friendId: me.id } })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
    updateFriendList();
  }

  return (
    <div>
      {'---------------------Friend Requests ----------------------------'}
      <List>
        {friendRequestList.map((u: User) => (
          <ListItemButton key={u.id} onClick={() => setShowRequest(!showRequest)}>
            {showRequest ? (
              <div>
                <button onClick={accept} value={u.id}>
                  accept
                </button>
                <button onClick={decline} value={u.id}>
                  decline
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
      {'---------------------Friend List ----------------------------'}
      <List>
        {friendList.map((u: User) => (
          <ListItemButton key={u.id} onClick={() => setShowOptions(!showOptions)}>
            {showOptions ? (
              <div>
                <button onClick={privateMessage} value={u.id}>
                  private message
                </button>
                <button onClick={unfriend} value={u.id}>
                  unfriend
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
    </div>
  );
};
export default FriendList;
