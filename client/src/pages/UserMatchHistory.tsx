import { useParams } from 'react-router-dom';
import TableMatchHistory from '../Components/Game/Ranking/TableMatchHistory';
import { Container, Grid } from '@mui/material';
import '../CSS/rainbow.css';

const UserMatchHistory = () => {
  let { userId } = useParams();

  return (
    <Container maxWidth="xl">
      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <h1 className="classic" style={{ textAlign: 'center', fontSize: '3em', opacity: '0.6' }}>
            Match History
          </h1>
        </Grid>
        <Grid item md={8}>
          <TableMatchHistory userId={userId} limit={0} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserMatchHistory;
