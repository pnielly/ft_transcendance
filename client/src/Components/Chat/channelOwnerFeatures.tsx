import { useContext } from 'react';
import { UserContext } from '../../Contexts/userContext';
import Channel from '../Interfaces/channel.interface';
import User from '../Interfaces/user.interface';
import AdminList from './ownerFeatures/adminList';
import ChangePassword from './ownerFeatures/changePassword';
import ProtectedToPublic from './ownerFeatures/protectedToPublic';
import PublicToProtected from './ownerFeatures/publicToProtected';
import SetAdmin from './ownerFeatures/setAdmin';

// OWNER CAN :
// - make access: protected -> public (TODO)
// - make access: public -> protected (set password) (TODO)
// - change password (TODO)
// - set/unset admins (TODO)

type Props = {
  activeChannel: Channel;
  adminList: User[];
  memberList: User[];
};

const ChannelOwnerFeatures = (props: Props) => {
  const { activeChannel, adminList, memberList } = props;
  const me = useContext(UserContext).user;

  if (activeChannel.id !== me.id) return (<div></div>);
  return (
    <div>
      <h3>{'Channel owner section'}</h3>
      {activeChannel.access === 'public' ? <PublicToProtected activeChannel={activeChannel} /> : ''}
      {activeChannel.access === 'protected' ? (
        <div>
          <ProtectedToPublic activeChannel={activeChannel} />
          <ChangePassword activeChannel={activeChannel} />
        </div>
      ) : (
        ''
      )}
      <SetAdmin activeChannel={activeChannel} memberList={memberList} adminList={adminList} />
      <AdminList adminList={adminList} activeChannel={activeChannel} />
    </div>
  );
};

export default ChannelOwnerFeatures;
