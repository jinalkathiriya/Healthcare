import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import Login from './pages/Login';
import AppContextProvider from './context/AppContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorAppointments from './pages/Doctor/DoctorAppointment'; // ✅ Import added
import { AdminContext } from './context/AdminContext';
import { DoctorContext } from './context/DoctorContext';

const AppContent = () => {
  const { aToken } = React.useContext(AdminContext);
  const { dToken, isDoctorLoggedIn, doctorInfo } = React.useContext(DoctorContext); // ✅ assuming doctorInfo stores logged-in doctor

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {(aToken || (dToken && isDoctorLoggedIn)) ? (
        <div className='bg-[#F8F9FD]'>
          <Navbar />
          <div className='flex items-start'>
            <Sidebar />
            <Routes>
              {/* Admin routes */}
              {aToken && (
                <>
                  <Route path="/" element={<Navigate to="/admin-dashboard" />} />
                  <Route path="/admin-dashboard" element={<Dashboard />} />
                  <Route path="/all-appointments" element={<AllAppointments />} />
                  <Route path="/add-doctor" element={<AddDoctor />} />
                  <Route path="/doctor-list" element={<DoctorsList />} />
                </>
              )}

              {/* Doctor routes */}
              {dToken && isDoctorLoggedIn && (
                <>
                  <Route path="/" element={<Navigate to="/doctor-dashboard" />} />
                  <Route path="/doctor-dashboard" element={<DoctorDashboard doctor={doctorInfo} />} />
                  <Route path="/doctor-profile" element={<DoctorProfile doctor={doctorInfo} />} />
                  <Route path="/doctor-appointments" element={<DoctorAppointments doctor={doctorInfo} />} />
                </>
              )}
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </>
  );
};

const App = () => (
  <AppContextProvider>
    <AppContent />
  </AppContextProvider>
);

export default App;
