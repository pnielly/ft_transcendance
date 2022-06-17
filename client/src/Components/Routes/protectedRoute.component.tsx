import { useContext } from 'react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../Contexts/userContext';
import axios from 'axios';
import User from '../../Interfaces/user.interface';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [page, setPage] = useState<JSX.Element>(<></>);
  const userContext = useContext(UserContext);
  useEffect(() => {
    const getUser = async () => {
      axios
        .get<User>(`${process.env.REACT_APP_DEFAULT_URL}/auth/user`, {
          withCredentials: true
        })
        .then((res) => {
          userContext.setUser(res.data);
          setPage(children);
        })
        .catch((err) => setPage(<Navigate to="/home" replace />));
    };
    getUser();
  }, []);

  return page;
}
