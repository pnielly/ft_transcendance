import { useContext } from 'react';
import { UserContext } from '../../Contexts/userContext';
import { userInfo } from '../../Interfaces/gameRoom.interface';
import { Avatar, Grid, Typography } from '@mui/material';

// side == 0 -> playerLeft, side == 1 -> playerRight
type Props = {
  side: number;
  player: userInfo | undefined;
};

const UserCard = (props: Props) => {
  const { side, player } = props;
  const me = useContext(UserContext).user;

  return (
    <Grid container direction="column" alignItems="center" spacing={1} sx={{ borderRadius: '20px', backgroundColor: 'rgb(28, 26, 26)', width: '350px', height: '250px', marginTop: '40px' }}>
      <Grid item sx={{ marginTop: '20px' }}>
        <Avatar src={player?.avatar} alt={`img of ${player?.username}`} sx={{ width: '100px', height: '100px' }} />
      </Grid>
      <Grid item>
        <Typography variant="h6">{player?.username}</Typography>
      </Grid>
    </Grid>
  );
};

export default UserCard;
