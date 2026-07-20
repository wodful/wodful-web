import { PublicLayout } from '@/components/public/PublicLayout';
import Access from '@/pages/public/Access';
import PublicLeaderboard from '@/pages/public/Leaderboard';
import Login from '@/pages/public/Login';
import PublicSchedule from '@/pages/public/Schedule';
import PublicWorkouts from '@/pages/public/Workout';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const PublicRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/access" element={<Access />} />

        <Route path="/championships" element={<Navigate to="/login" replace />} />
        <Route path="/championships/:id/*" element={<Navigate to="/login" replace />} />

        <Route path="/access/:code" element={<PublicLayout />}>
          <Route path="leaderboards" element={<PublicLeaderboard />} />
          <Route path="schedules" element={<PublicSchedule />} />
          <Route path="workouts" element={<PublicWorkouts />} />
          <Route index element={<Navigate to="leaderboards" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default PublicRoutes;
