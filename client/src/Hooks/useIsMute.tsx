import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { SocketContext } from '../Contexts/socket';
import Channel from '../Interfaces/channel.interface';
import User from '../Interfaces/user.interface';

const useIsMute = (user: User, activeChannel: Channel) => {
  const [muteList, setMuteList] = useState<User[]>([]);
  const sockContext = useContext(SocketContext);

  // update muteList
  const updateMuteList = useCallback(() => {
    if (activeChannel?.id) {
      axios
        .get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${activeChannel.id}/get_muted`, { withCredentials: true })
        .then((res) => setMuteList(res.data))
        .catch((err) => console.log(err));
    }
  }, [activeChannel]);

  // update muteList on change
  useEffect(() => {
    sockContext.socketChat.on('updateMuteList', updateMuteList);
    return () => {
      sockContext.socketChat.off('updateMuteList', updateMuteList);
    };
  }, [activeChannel]);
};
