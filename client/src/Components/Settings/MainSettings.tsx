import { Grid } from '@mui/material';
import ChangeUsername from './ChangeUsername';
import UploadAvatar from './UploadAvatar';
import UserDetailSettings from './UserDetailSettings';
import User from '../../Interfaces/user.interface';

type Props = {
  user: User;
};

const MainSettings = (props: Props) => {
  const { user } = props;

  return (
    <Grid container direction="column" alignItems="center">
      <UserDetailSettings selectedUser={user} />
      <Grid
        container
        justifyContent="center"
        sx={{
          marginTop: '40px',
          padding: '20px 10px 20px 0px',
          '&:hover': {
            opacity: [0.9, 0.8, 0.7]
          },
          border: 'solid 2px',
          borderRadius: '20px',
          maxWidth: '400px'
        }}
      >
        <ChangeUsername user={user} />
      </Grid>
      <Grid
        container
        justifyContent="center"
        sx={{
          marginTop: '40px',
          padding: '20px 10px 20px 0px',
          '&:hover': {
            opacity: [0.9, 0.8, 0.7]
          },
          border: 'solid 2px',
          borderRadius: '20px',
          maxWidth: '400px'
        }}
      >
        <UploadAvatar user={user} />
      </Grid>
    </Grid>
  );
};

export default MainSettings;
