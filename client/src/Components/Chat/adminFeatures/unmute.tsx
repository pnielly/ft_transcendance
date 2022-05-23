import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import Channel from '../../Interfaces/channel.interface';
import User from '../../Interfaces/user.interface';

type Props = {
  muteList: User[];
  activeChannel: Channel;
};

const Unmute = (props: Props) => {
  const { muteList, activeChannel } = props;
  const [toUnmute, setToUnmute] = useState<number>(); // used to select member to unmute
  const sockContext = useContext(SocketContext);

  // UNMUTE A MEMBER //////////////////////////////////////////////////
  const unmuteMember = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // remove from muteList
    console.log('unMute : ', toUnmute);
    sockContext.socketChat.emit('removeMute', { channelId: activeChannel.id, muteId: toUnmute });
  };

  return (
    <div>
      {' '}
      <h4>{'Unmute a member'}</h4>
      <button type="submit" onClick={unmuteMember}>
        unmute this member
      </button>
      <select id="unMute" defaultValue={'select'} onChange={(e) => setToUnmute(Number(e.currentTarget.value))}>
        <option value={'select'} disabled hidden>
          {' '}
          -- who? --{' '}
        </option>
        {muteList.map((user) => (
          <option value={user.id} key={user.id}>
            {user.username}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Unmute;
