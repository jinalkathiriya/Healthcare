import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const { token, setToken, userData } = useContext(AppContext);

    const navLinkClasses = ({ isActive }) =>
        isActive ? 'py-1 border-b-2 border-black' : 'py-1';

    const mobileNavLinkClasses = ({ isActive }) =>
        isActive ? 'px-4 py-2 rounded inline-block border-b-2 border-black' : 'px-4 py-2 rounded inline-block';

    return (
        <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 relative z-50'>
            {/* Logo */}
            <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt="Logo" />

            {/* Desktop Nav */}
            <ul className='hidden md:flex items-start gap-5 font-medium'>
                <NavLink to='/' className={navLinkClasses}><li>Home</li></NavLink>
                <NavLink to='/doctors' className={navLinkClasses}><li>All Doctors</li></NavLink>
                <NavLink to='/about' className={navLinkClasses}><li>About</li></NavLink>
                <NavLink to='/contact' className={navLinkClasses}><li>Contact</li></NavLink>
                <button
                    onClick={() => window.location.href = 'http://localhost:5174'}
                    className='border px-5 text-xs py-1.5 rounded-full hover:bg-black hover:text-white transition-all duration-500'
                >
                    Admin panel
                </button>
            </ul>

            {/* Right Section */}
            <div className='flex items-center gap-4 relative'>
                {token ? (
                    <div className='relative group'>
                        <div className='flex items-center gap-2 cursor-pointer'>
                            <img
                                className='w-8 h-8 rounded-full object-cover'
                                src={
                                    userData?.image
                                        ? userData.image
                                        : assets.upload_area
                                }
                                alt="Profile"
                            />
                            <span className="text-sm font-medium text-gray-700">{userData?.name?.split(' ')[0]}</span>
                            <img className='w-2.5' src={assets.dropdown_icon} alt="Dropdown Icon" />
                        </div>

                        {/* Dropdown */}
                        <div className='absolute right-0 pt-2 text-base font-medium text-gray-600 hidden group-hover:flex flex-col z-50'>
                            <div className='bg-stone-100 rounded shadow-md min-w-48 p-4 flex flex-col gap-4'>
                                <p onClick={() => navigate('/my-profile')} className='hover:text-black cursor-pointer'>My Profile</p>
                                <p onClick={() => navigate('/my-appointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
                                <p
                                    onClick={() => {
                                        setToken('');
                                        localStorage.removeItem('token');
                                        navigate('/');
                                    }}
                                    className='hover:text-black cursor-pointer'
                                >
                                    Logout
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block hover:scale-105 transition duration-300'
                    >
                        Create account
                    </button>

                )}

                {/* Hamburger Icon */}
                <img
                    onClick={() => setShowMenu(true)}
                    className='w-6 md:hidden'
                    src={assets.menu_icon}
                    alt="Menu"
                />
            </div>

            {/* Mobile Menu */}
            <div className={`fixed md:hidden top-0 right-0 w-[75%] h-full bg-white z-40 shadow-lg transform transition-transform duration-300 ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className='flex items-center justify-between px-5 py-6 border-b'>
                    <img className='w-36' src={assets.logo} alt="Logo" />
                    <img
                        className='w-7 cursor-pointer'
                        onClick={() => setShowMenu(false)}
                        src={assets.cross_icon}
                        alt="Close"
                    />
                </div>
                <ul className='flex flex-col items-start gap-5 p-5 text-base font-medium'>
                    <NavLink to='/' onClick={() => setShowMenu(false)} className={mobileNavLinkClasses}>Home</NavLink>
                    <NavLink to='/doctors' onClick={() => setShowMenu(false)} className={mobileNavLinkClasses}>All Doctors</NavLink>
                    <NavLink to='/about' onClick={() => setShowMenu(false)} className={mobileNavLinkClasses}>About</NavLink>
                    <NavLink to='/contact' onClick={() => setShowMenu(false)} className={mobileNavLinkClasses}>Contact</NavLink>
                </ul>
            </div>
        </div>
    );
};

export default Navbar;
