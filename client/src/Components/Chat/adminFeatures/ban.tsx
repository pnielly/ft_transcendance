import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import Channel from '../../Interfaces/channel.interface';
import User from '../../Interfaces/user.interface';

type Props = {
  memberList: User[];
  activeChannel: Channel;
  isAdmin: (user: User) => boolean;
};

const Ban = (props: Props) => {
  const { memberList, activeChannel, isAdmin } = props;
  const sockContext = useContext(SocketContext);
  const [toBan, setToBan] = useState<number>(); // used to select member to ban

  // BANNING A MEMBER //////////////////////////////////////////

  const banMember = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // add to banList
    console.log('banning : ', toBan);
    sockContext.socketChat.emit('addBan', { channelId: activeChannel.id, banId: toBan });
    // remove from memberList
    sockContext.socketChat.emit('removeMember', { channelId: activeChannel.id, memberId: toBan });
  };

  return (
    <div>
      <h4>{'Ban a member'}</h4>
      <button type="submit" onClick={banMember}>
        ban this member
      </button>
      <select id="ban" defaultValue={'select'} onChange={(e) => setToBan(Number(e.currentTarget.value))}>
        <option value={'select'} disabled hidden>
          {' '}
          -- who? --{' '}
        </option>
        {memberList.map((user) =>
          !isAdmin(user) ? (
            <option value={user.id} key={user.id}>
              {user.username}
            </option>
          ) : (
            ''
          )
        )}
      </select>
    </div>
  );
};

export default Ban;
