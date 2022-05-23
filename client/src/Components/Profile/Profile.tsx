import { Typography, Button, Grid, Input } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRanking } from '../../pages/Ranking.pages';
import { useForm } from 'react-hook-form';

type Props = {
  profile: UserRanking;
};

const label = { inputProps: { 'aria-label': 'Switch demo' } };

const Profile = (props: Props) => {
  const { profile } = props;
  let navigate = useNavigate();
  const navToMatchHistory = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate(`/history/${profile.user.id}`);
  };

  return (
    <Grid container direction="column" justifyContent="center" alignItems="center" sx={{ margin: '40px' }}>
      <Grid item>
        <Typography variant="h5">User Profile: {profile.user.username} </Typography>
        <img src={profile.user.avatar} style={{ maxWidth: '200px' }}></img>
        <Typography variant="body1">Rank: {profile.rank}</Typography>
        <Typography variant="body1">Win {profile.win}</Typography>
        <Typography variant="body1">Defeat: {profile.defeat}</Typography>
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={navToMatchHistory}>
          See Match History
        </Button>
      </Grid>
    </Grid>
  );
};

export default Profile;
