import { List, ListItemText } from '@mui/material';
import axios from 'axios';
import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import { UserContext } from '../../../Contexts/userContext';
import Channel from '../../Interfaces/channel.interface';
import User from '../../Interfaces/user.interface';

type Props = {
  setActiveChannel: (channel: Channel) => void;
  channelList: Channel[];
};

const AccessChannel = (props: Props) => {
  const { setActiveChannel, channelList } = props;
  const [selectedChannel, setSelectedChannel] = useState<Channel>();
  const sockContext = useContext(SocketContext);
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const me = useContext(UserContext).user;
  const [banList, setBanList] = useState<User[]>([])

  // ENTERING A CHANNEL ///////////////////////////////
  const accessChannel = (e: React.MouseEvent<HTMLButtonElement>) => {
    const channel: Channel = channelList.find((r) => String(r.id) === e.currentTarget.value)!;
    // showPasswordInput is reset to false by default
    setShowPasswordInput(false);
    if (channel) {
      if (channel.access === 'protected') setShowPasswordInput(true);
      else enterChannel(channel);
      setSelectedChannel(channel);
    }
  };

  // BANLIST
  function amIBanned(channel: Channel) {
    axios
      .get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${channel.id}/get_banned`)
      .then((res) => setBanList(res.data))
      .catch((err) => console.log(err));
    let res: boolean = false;
    banList.map((e) => (e.id === me.id ? (res = true) : null));
    return res;
  }

  function enterChannel(channel: Channel) {
    if (amIBanned(channel)) {
      alert("You can't enter this room anymore, you got banned by an admin :/");
      return;
    }
    sockContext.socketChat.emit('accessRoom', channel);
    setActiveChannel(channel);
    // add myself as a member (if i'm already one, backend will do nothing)
    sockContext.socketChat.emit('addMember', { channelId: channel.id, memberId: me.id });
  }
  /////////////////////////////////////////

  // PASSWORD HANDLING //////////////////////////

  function verifyPassword() {
    if (selectedChannel) {
      axios
        .post(`${process.env.REACT_APP_DEFAULT_URL}/channels/${selectedChannel.id}/check_password`, { password: password })
        .then((res) => {
          if (res.data === true) enterChannel(selectedChannel);
          else alert(`[Debug] \'${password}\' is a wrong password`);
        })
        .catch((err) => console.log(err));
    }
  }

  function handleTyping(e: React.FormEvent<HTMLInputElement>) {
    setPassword(e.currentTarget.value);
  }

  ////////////////////////////////////

  // DELETE CHANNEL
  const deleteChannel = (e: React.MouseEvent<HTMLButtonElement>) => {
    sockContext.socketChat.emit('channelDelete', Number(e.currentTarget.value));
  };

  ///////////////////////////////////////

  // DISPLAY LISTING
  const displayListing = (e: Channel) => {
    return (
      <React.Fragment key={e.id}>
        <button onClick={accessChannel} value={e.id}>
          {e.name}
          {' | '}
          {e.access}
        </button>
        {e.owner.id === me.id ? (
          <button value={e.id} onClick={deleteChannel}>
            delete
          </button>
        ) : (
          ''
        )}
        {/* {display password input if needed} */}
        {showPasswordInput && selectedChannel === e ? (
          <div>
            {'Please enter the password: '}
            <input type="password" value={password} onChange={handleTyping} />
            <button type="submit" onClick={verifyPassword}>
              Enter
            </button>
          </div>
        ) : (
          ''
        )}
        <ListItemText primary={e.name}>{e.name}</ListItemText>
        <ListItemText secondary={e.access}></ListItemText>
      </React.Fragment>
    );
  };

  return (
    <List>
      {/* do not display direct messaging channels (reserved for the friendList component) */}
      <h3>{'Public and Protected'}</h3>
      {channelList
        .filter((e) => e.name.substring(0, 3) !== 'dm-')
        .filter((e) => e.access !== 'private')
        .map((e) => displayListing(e))}
      <h3>{'Private'}</h3>
      {channelList
        .filter((e) => e.name.substring(0, 3) !== 'dm-')
        .filter((e) => e.access === 'private')
        .map((e) => displayListing(e))}
    </List>
  );
};

export default AccessChannel;
