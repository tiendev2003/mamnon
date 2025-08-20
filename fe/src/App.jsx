import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AuthInit from './components/AuthInit'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import Profile from './pages/Profile'
import AdminLayout from './components/Layout/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Students from './pages/admin/Students'
import Teachers from './pages/admin/Teachers'
import Classes from './pages/admin/Classes'
import Schedules from './pages/admin/Schedules'
import TherapySessions from './pages/admin/TherapySessions'
import Users from './pages/admin/Users'
import Reports from './pages/admin/Reports'

function App() {
  return (
    <AuthInit>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Admin/Staff Routes - Sử dụng chung layout */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/teachers" element={<Teachers />} />
                  <Route path="/classes" element={<Classes />} />
                  <Route path="/schedules" element={<Schedules />} />
                  <Route path="/therapy" element={<TherapySessions />} />
                  <Route path="/users" element={
                    <ProtectedRoute requireAdmin={true}>
                      <Users />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthInit>
  )
}

export default App
