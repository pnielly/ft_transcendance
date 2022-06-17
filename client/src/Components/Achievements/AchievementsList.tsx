import { Grid } from '@mui/material';
import User from '../../Interfaces/user.interface';
import Achievement from './Achievement';

type Props = {
  selectedUser: User;
};

export type TypeAchievement = {
  title: string;
  discribe: string;
  condition: number;
  status: string;
};

const achievements: TypeAchievement[] = [
  {
    title: 'Toddler',
    discribe: 'Play 1 ranked game',
    condition: 1,
    status: 'play'
  },
  {
    title: 'On the edge',
    discribe: 'Win 5:4 in a ranked game',
    condition: 4,
    status: 'score'
  },
  {
    title: 'Veteran',
    discribe: 'Win 50 ranked games',
    condition: 50,
    status: 'win'
  },
  {
    title: 'Top Scorer',
    discribe: 'Score 100 goals in ranked games',
    condition: 100,
    status: 'goals'
  },
  {
    title: 'I am your god now',
    discribe: 'Win 5:0 in a ranked game',
    condition: 0,
    status: 'score'
  },
  {
    title: 'Legend',
    discribe: 'Win 100 ranked games',
    condition: 100,
    status: 'win'
  }
];



const AchievementsList = (props: Props) => {
  return (
    <Grid container sx={{ padding: '5px' }} spacing={4} justifyContent="center" alignItems="center">
      {achievements.map((achiev, i) => (
        <Grid item md={6} lg={4} xs={12} key={i}>
          <Achievement achievement={achiev} selectedUser={props.selectedUser} key={i} />
        </Grid>
      ))}
    </Grid>
  );
};

export default AchievementsList;
