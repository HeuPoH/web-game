import { useEffect, useState } from 'react';
import { Route, Router, Routes } from 'react-router';

import { Home } from '../../pages/home';
import { NewRoom } from '../../pages/new-room';
import { RoomEntry } from '../../pages/room';
import { ProtectedRouter } from './protected-router';
import { customHistory } from '../../shared/lib';
import { Rooms } from '../../pages/rooms';
import { Game } from '../../pages/game';
import { Lobby } from '../../pages/lobby';
import { Help } from '../../pages/help';

export function Routers() {
  const [location, setLocation] = useState(customHistory.location);

  useEffect(() => {
    return customHistory.listen(({ location }) => setLocation(location));
  }, []);

  return (
    <Router location={location} navigator={customHistory}>
      <Routes>
        <Route path='/' index element={<Home />} />
        <Route
          path='/new-room'
          element={<ProtectedRouter><NewRoom /></ProtectedRouter>}
        />
        <Route
          path='/help'
          element={<Help />}
        />
        <Route
          path='/room/:id'
          element={<ProtectedRouter><RoomEntry /></ProtectedRouter>}
        >
          <Route
            path='lobby'
            element={<ProtectedRouter><Lobby /></ProtectedRouter>}
          />
          <Route
            path='game'
            element={<ProtectedRouter><Game /></ProtectedRouter>}
          />
        </Route>
        <Route
          path='/rooms'
          element={<ProtectedRouter><Rooms /></ProtectedRouter>}
        />
      </Routes>
    </Router>
  );
}
