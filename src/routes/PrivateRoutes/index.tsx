import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Header } from '@/components/Header';
import { EventShell } from '@/components/event/EventShell';
import Category from '@/pages/private/Category';
import Championship from '@/pages/private/Championship';
import EventHome from '@/pages/private/EventHome';
import EventSettings from '@/pages/private/EventSettings';
import PrivateLeaderboard from '@/pages/private/Leaderboard';
import Participants from '@/pages/private/Participants';
import Result from '@/pages/private/Result';
import Schedule from '@/pages/private/Schedule';
import Subscription from '@/pages/private/Subscription';
import Ticket from '@/pages/private/Ticket';
import Workout from '@/pages/private/Workout';
import Coupons from '@/pages/private/Coupons';

const PrivateRoutes = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Championship />} />
        <Route path="/championships" element={<Championship />} />
        <Route path="/login" element={<Navigate to="/championships" replace />} />

        <Route path="/championships/:id" element={<EventShell />}>
          <Route index element={<EventHome />} />
          <Route path="leaderboards" element={<PrivateLeaderboard />} />
          <Route path="participants" element={<Participants />} />
          <Route path="categories" element={<Category />} />
          <Route path="tickets" element={<Ticket />} />
          <Route path="workouts" element={<Workout />} />
          <Route path="results" element={<Result />} />
          <Route path="subscriptions" element={<Subscription />} />
          <Route path="schedules" element={<Schedule />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="settings" element={<EventSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default PrivateRoutes;
