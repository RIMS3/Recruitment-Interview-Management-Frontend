import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import JobList from '../pages/JobList';
import SavedJobs from '../pages/SavedJobs';
import ApplicationList from '../Applications/ApplicationList';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/jobs" element={<JobList />} />
      <Route path="/saved-jobs" element={<SavedJobs />} />
      <Route path="/employer/applications" element={<ApplicationList />} />
      <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
  );
};

export default AppRoutes;