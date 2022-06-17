import { Avatar, Grid, Typography } from '@mui/material';
import React from 'react';
import User from '../../Interfaces/user.interface';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';

interface Stats {
  win: number;
  defeat: number;
  rank: number;
  points: number;
}

type Props = {
  selectedUser: User | undefined;
  stats: Stats | undefined;
};

const CardUser = (props: Props) => {
  const { selectedUser, stats } = props;
  return (
    <React.Fragment>
      <Grid item sx={{ marginTop: '20px' }}>
        <Avatar src={selectedUser?.avatar} alt={`img of ${selectedUser?.username}`} sx={{ width: '100px', height: '100px' }} />
      </Grid>
      <Grid item>
        <Typography variant="h6">{selectedUser?.username}</Typography>
      </Grid>
      {stats ? (
        <React.Fragment>
          <Grid item>
            <Typography variant="h6" sx={{ display: 'inline' }}>{`Elo: ${stats?.points}`}</Typography>
            <EmojiEventsIcon />
          </Grid>
          <Grid item>
            <Typography variant="h6" sx={{ display: 'inline' }}>{`Win: ${stats?.win}`}</Typography>
            <CallMadeIcon />
          </Grid>
          <Grid item>
            <Typography variant="h6" sx={{ display: 'inline' }}>{`Defeat: ${stats?.defeat}`}</Typography>
            <CallReceivedIcon />
          </Grid>
        </React.Fragment>
      ) : (
        <Typography variant="h6">No Stats available yet</Typography>
      )}
    </React.Fragment>
  );
};

export default CardUser;
