import { Chip, Grid, Typography, Button } from '@mui/material';
import User from '../../../Interfaces/user.interface';
import TableMatchHistory from '../../Game/Ranking/TableMatchHistory';
import { useNavigate } from 'react-router-dom';
import '../../../CSS/rankingButton.css';
import AchievementsList from '../../Achievements/AchievementsList';
import { useLayoutEffect, useState } from 'react';

type Props = {
  selectedUser: User;
};

const UserStats = (props: Props) => {
  const { selectedUser } = props;
  const [screenWidth, setScreenWidth] = useState<number | undefined>(0);

  let navigate = useNavigate();

  const handleClick = () => {
    navigate(`/history/${selectedUser?.id}`);
  };

  const handleClickRanking = () => {
    navigate('/ranking');
  };

  useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth != screenWidth) setScreenWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Grid container direction="column" alignItems="center" justifyContent="center">
      <Grid item sx={{ marginTop: '20px' }}>
        <Button className="ranking-glow" onClick={handleClickRanking}>
          SEE RANKING
        </Button>
      </Grid>
      <Grid item sx={{ marginTop: '25px' }}>
        <AchievementsList selectedUser={selectedUser} />
      </Grid>
      {screenWidth && screenWidth > 600 ? (
        <Grid item>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ margin: '20px 0 20px 0' }}>
            <Typography variant="h4" sx={{ marginLeft: '20px' }}>
              Last Games
            </Typography>
            <Chip className='ranking-glow neon' label="Full History" onClick={handleClick} />
          </Grid>
          <TableMatchHistory userId={selectedUser?.id} limit={5} />
        </Grid>
      ) : (
        <Button className="ranking-glow" onClick={handleClick}>
          See Match History
        </Button>
      )}
    </Grid>
  );
};

export default UserStats;
