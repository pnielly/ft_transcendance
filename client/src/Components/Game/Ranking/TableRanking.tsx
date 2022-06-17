import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { UserRanking } from '../../../pages/Ranking';

type Props = {
  ranking: UserRanking[];
};

const TableRanking = (props: Props) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 600 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Rank</TableCell>
            <TableCell align="center">Username</TableCell>
            <TableCell align="center">Victory</TableCell>
            <TableCell align="center">Defeat</TableCell>
            <TableCell align="center">Elo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.ranking.map((row, i) => (
            <TableRow key={row.user.username} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align="center">{i + 1}</TableCell>
              <TableCell align="center" component="th" scope="row">
                {row.user.username}
              </TableCell>
              <TableCell align="center">{row.win}</TableCell>
              <TableCell align="center">{row.defeat}</TableCell>
              <TableCell align="center">{row.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableRanking;
