import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  const logout = () => {
    if (aToken) {
      localStorage.removeItem('aToken');
      setAToken('');
    }
    if (dToken) {
      localStorage.removeItem('dToken');
      setDToken('');
    }

    navigate('/login');
  };

  const userRole = aToken ? 'Admin' : dToken ? 'Doctor' : 'Guest';

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img onClick={() => navigate('/')} className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="Logo" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{userRole}</p>
      </div>
      {(aToken || dToken) && (
        <button onClick={logout} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>
          Logout
        </button>
      )}
    </div>
  );
};

export default Navbar;
