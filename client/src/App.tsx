import React, { useContext, useState } from 'react';
import { Route, Routes, Outlet, Link } from 'react-router-dom';
import { SocketContext } from './Contexts/socket';
import Login42 from './pages/login42.pages';
import ProtectedRoute from './Components/Routes/protectedRoute.component';
import Pong from './Components/Game/Pong';
import { UserContext } from './Contexts/userContext';
import StyledChat from './pages/Chat';
import ResponsiveAppBar from './Components/NavBar/navBar.component';
import FakeLogin from './pages/FakeLogin.pages';
import Ranking from './pages/Ranking.pages';
import UserMatchHistory from './pages/UserMatchHistory';
import UserProfile from './pages/UserProfile';
import SettingsUser from './pages/SettingsUser';

type Props = {};

const App: React.FunctionComponent<Props> = (props: Props) => {
  const [user, setUser] = useState({ id: -1, username: '', id_42: '', avatar: '' });
  const sockContext = useContext(SocketContext);

  return (
    <div className="App">
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
              <Route path="game" element={<Pong />} />
              <Route path="chat" element={<StyledChat />} />
              <Route path="ranking" element={<Ranking />}></Route>
              <Route path="history">
                <Route path=":userId" element={<UserMatchHistory />}></Route>
              </Route>
              <Route path="profile">
                <Route path=":userId" element={<UserProfile />}></Route>
              </Route>
              <Route path="settings" element={<SettingsUser />} />
            </Route>

            <Route path="/login" element={<Login42 />} />
            <Route path="/fakelogin" element={<FakeLogin />} />
          </Routes>
        </SocketContext.Provider>
      </UserContext.Provider>
    </div>
  );
};

export default App;
