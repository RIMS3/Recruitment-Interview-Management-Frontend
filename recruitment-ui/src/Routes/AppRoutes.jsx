import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import JobList from "../pages/JobList";
import SavedJobs from "../pages/SavedJobs";
import ApplicationList from "../Applications/ApplicationList";
import ProtectedRoute from "../Auth/ProtectedRoute";
import SelectRole from "../Auth/SelectRole";
import CreateCompany from "../Auth/CreateCompany";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/jobs" element={<JobList />} />

      {/* Trang chọn role */}
      <Route
        path="/select-role"
        element={
          <ProtectedRoute>
            <SelectRole />
          </ProtectedRoute>
        }
      />

      {/* Saved jobs - chỉ cần login */}
      <Route
        path="/saved-jobs"
        element={
          <ProtectedRoute>
            <SavedJobs />
          </ProtectedRoute>
        }
      />

      {/* Employer only */}
      <Route
        path="/employer/applications"
        element={
          <ProtectedRoute requiredRole={3}>
            <ApplicationList />
          </ProtectedRoute>
        }
      />
      {/* TEST FRONTEND ONLY */}
      <Route path="/create-company" element={<CreateCompany />} />

      {/* Default */}
      <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
  );
};

export default AppRoutes;