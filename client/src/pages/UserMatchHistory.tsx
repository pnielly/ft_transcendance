import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import React, { useState } from 'react';
import { useEffect } from 'react';
import User from '../Components/Interfaces/user.interface';
import { useParams } from 'react-router-dom';
import TableMatchHistory from '../Components/Ranking/TableMatchHistory';
import { Button } from '@mui/material';

interface MatchHistory {
  id: number;
  score1: number;
  score2: number;
  winner: number;
  createdAt: Date;
  player1: User;
  player2: User;
}

const UserMatchHistory = () => {
  let { userId } = useParams();
  const [status, setStatus] = useState<'ladder' | 'friendly'>('ladder');

  function handleChange(e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.value === 'ladder') setStatus('friendly');
    else setStatus('ladder');
  }

  return (
    <React.Fragment>
      <Button onClick={handleChange} value={status}>
        See {status === 'ladder' ? 'friendly' : 'ladder'} history
      </Button>
      <TableMatchHistory status={status} userId={userId} />
    </React.Fragment>
  );
};

export default UserMatchHistory;
