import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import Channel from '../../Interfaces/channel.interface';
import User from '../../Interfaces/user.interface';

type Props = {
  banList: User[];
  activeChannel: Channel;
};

const Unban = (props: Props) => {
  const { activeChannel, banList } = props;
  const [toUnban, setToUnban] = useState<number>(); // used to select member to unban
  const sockContext = useContext(SocketContext);

  // UNBANNING A MEMBER ////////////////////////////////////////////
  const unbanMember = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // remove from banList
    console.log('unban : ', toUnban);
    sockContext.socketChat.emit('removeBan', { channelId: activeChannel.id, bannedId: toUnban });
    // add to memberList
    sockContext.socketChat.emit('addMember', { channelId: activeChannel.id, memberId: toUnban });
  };

  return (
    <div>
      <h4>{'Unban a member'}</h4>
      <button type="submit" onClick={unbanMember}>
        unban this member
      </button>
      <select id="unban" defaultValue={'select'} onChange={(e) => setToUnban(Number(e.currentTarget.value))}>
        <option value={'select'} disabled hidden>
          {' '}
          -- who? --{' '}
        </option>
        {banList.map((user) => (
          <option value={user.id} key={user.id}>
            {user.username}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Unban;
