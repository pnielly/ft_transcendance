import React, { useContext, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { SocketContext } from './Contexts/socket';
import Login42 from './pages/Login42';
import ProtectedRoute from './Components/Routes/protectedRoute.component';
import Pong from './pages/Pong';
import { UserContext } from './Contexts/userContext';
import ResponsiveAppBar from './Components/NavBar/navBar';
import FakeLogin from './pages/FakeLogin';
import Ranking from './pages/Ranking';
import UserMatchHistory from './pages/UserMatchHistory';
import TwoFwaLogin from './pages/TwoFwaLogin';
import Chat from './pages/Chat';
import Users from './pages/Users';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, CssBaseline } from '@mui/material';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import Channel from './Interfaces/channel.interface';
import Match from './pages/Match';

type Props = {};

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#272727'
    }
  }
});

const App: React.FunctionComponent<Props> = (props: Props) => {
  const [user, setUser] = useState({ id: '-1', username: '', id_42: '', avatar: '', isTwoFactorAuthenticationEnabled: false });
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;
  const [activeChannel, setActiveChannel] = useState<Channel | undefined>();
  const location = useLocation();

  // join own channel where all personnal requests will be received (invitations to join games, channels, friend requests)
  useEffect(() => {
    sockContext.socketChat.emit('online', me.id);
  }, [sockContext.socketChat, me.id]);

  // tell pong i m online
  useEffect(() => {
    sockContext.socketPong.emit('online', me.id);
  }, [sockContext.socketPong, me.id]);

  // tell users i m online
  useEffect(() => {
    sockContext.socketUser.emit('online', me.id);
  }, [sockContext.socketUser, me.id]);

  // prevent scrolling when playing pong (since we use the mouse/touchpad/touchscreen)
  useEffect(() => {
    if (window.location.pathname.indexOf('/match') >= 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
  }, [location]);

  return (
    <div className="App">
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <UserContext.Provider value={{ user: user, setUser: setUser }}>
          <SocketContext.Provider value={sockContext}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ResponsiveAppBar />
                  </ProtectedRoute>
                }
              >
                {/* Protected Routes */}
                <Route path="game" element={<Pong />} />
                <Route path="match">
                  <Route path=":roomId" element={<Match />} />
                </Route>
                <Route path="chat" element={<Chat activeChannel={activeChannel} setActiveChannel={setActiveChannel} />} />
                <Route path="users" element={<Users activeChannel={activeChannel} />} />
                <Route path="ranking" element={<Ranking />}></Route>
                <Route path="history">
                  <Route path=":userId" element={<UserMatchHistory />}></Route>
                </Route>
                <Route path="settings">
                  <Route path=":userId" element={<Settings />}></Route>
                </Route>
              </Route>
              {/* Public routes  */}
              <Route path="/home" element={<LandingPage />} />
              <Route path="/2fwa" element={<TwoFwaLogin />} />
              <Route path="/login" element={<Login42 />} />
              <Route path="/fakelogin" element={<FakeLogin />} />
            </Routes>
          </SocketContext.Provider>
        </UserContext.Provider>
      </ThemeProvider>
    </div>
  );
};

export default App;
