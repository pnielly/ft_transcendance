import axios from 'axios';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Profile from '../Components/Profile/Profile';
import { UserRanking } from './Ranking.pages';

const UserProfile = () => {
  let { userId } = useParams();
  const [ranking, setRanking] = useState<UserRanking | undefined>(undefined);

  useEffect(() => {
    axios
      .get<UserRanking>(`${process.env.REACT_APP_DEFAULT_URL}/ranking/${userId}`, { withCredentials: true })
      .then((res) => setRanking(res.data))
      .catch((err) => console.log(err));
  }, [userId]);

  return <div>{ranking ? <Profile profile={ranking} /> : <></>}</div>;
};

export default UserProfile;
