import { Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import User from '../../Interfaces/user.interface';
import axios from 'axios';
import MatchHistory from '../../Interfaces/matchHistory';
import '../../CSS/neon.css'

export type TypeAchievement = {
  title: string;
  discribe: string;
  condition: number;
  status: string;
};

interface Stats {
  win: number;
  defeat: number;
  rank: number;
  points: number;
}

type Props = {
  achievement: TypeAchievement;
  selectedUser: User;
};

const Achievement = (props: Props) => {
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const { achievement, selectedUser } = props;
  const [stats, setStats] = useState<Stats | undefined>();

  useEffect(() => {
    axios
      .get<Stats>(`${process.env.REACT_APP_DEFAULT_URL}/ranking/stats/${selectedUser?.id}`, { withCredentials: true })
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));
  }, [selectedUser]);

  const goalsAchieved = (condition: number) => {
    const totalGoals: number = matchHistory.reduce(function(total: number, match: MatchHistory) {
      return total + (selectedUser.id === match.player1.id ? match.score1 : match.score2)
    }, 0)
    if (totalGoals >= condition) return true;
    return false;
  }

  const scoreDifferenceAchieved = (condition: number) => {
    let ret: boolean = false
    matchHistory.map((match: MatchHistory) => {
      if (match.player1.id === selectedUser.id && match.score2 === condition) ret = true;
      if (match.player2.id === selectedUser.id && match.score1 === condition) ret = true;
    })
    return ret;
  }

  const isAchieved = (condition: number, status: string) => {
    if (!stats) return false;
    if (status === 'play' && stats.win + stats.defeat >= condition) return true;
    else if (status === 'win' && stats.win >= condition) return true;
    else if (status === 'goals' && goalsAchieved(condition)) return true;
    else if (status === 'score' && scoreDifferenceAchieved(condition)) return true;
    else return false;
  };

  useEffect(() => {
    axios
      .get<MatchHistory[]>(`${process.env.REACT_APP_DEFAULT_URL}/match/history/${selectedUser.id}`, { withCredentials: true })
      .then((res) => {
        setMatchHistory(res.data);
      })
      .catch((err) => console.log(err));
  }, [props]);

  return (
    <React.Fragment>
      {isAchieved(achievement.condition, achievement.status) ? (
        <Grid container direction="row" sx={{ borderRadius: '10px', backgroundColor: 'rgb(28, 26, 26)', margin: '5px' }} className='neon'>
          <Grid item xs={9} sx={{ paddingLeft: '20px' }}>
            <Typography variant="h5">{achievement.title}</Typography>
            <Typography variant="subtitle2">{achievement.discribe}</Typography>
            <Typography variant="h5" color="success">
              Achieved <CheckIcon />
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <MilitaryTechIcon color="success" sx={{ fontSize: '70px' }} />
          </Grid>
        </Grid>
      ) : (
        <Grid container direction="row" sx={{ borderRadius: '10px', backgroundColor: 'rgb(28, 26, 26)', opacity: '0.75', margin: '5px' }}>
          <Grid item xs={9} sx={{ paddingLeft: '20px' }}>
            <Typography variant="h5">{achievement.title}</Typography>
            <Typography variant="subtitle2">{achievement.discribe}</Typography>
            <Typography variant="h5" color="success" sx={{ visibility: 'hidden' }}>
              Achieved <CheckIcon />
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <MilitaryTechIcon color="error" sx={{ fontSize: '70px' }} />
          </Grid>
        </Grid>
      )}
    </React.Fragment>
  );
};

export default Achievement;
