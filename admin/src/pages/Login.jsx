import axios from 'axios'
import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'

const Login = () => {
  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const { setDToken, setIsDoctorLoggedIn, setDoctorId } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)
  const navigate = useNavigate()

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const trimmedEmail = (email || "").trim();
      const trimmedPassword = (password || "").trim();

      if (state === 'Admin') {
        const res = await axios.get(`${backendUrl}/admins?email=${trimmedEmail}&password=${trimmedPassword}`);
        if (res.data.length > 0) {
          const admin = res.data[0];
          const token = admin.token || admin.id; // fallback if token missing
          setAToken(token);
          localStorage.setItem('aToken', token);
          toast.success('Login successful');
          navigate('/admin-dashboard');
        } else {
          toast.error('Login failed');
        }
      } else {
        // ✅ Fetch all doctors and filter manually
        const res = await axios.get(`${backendUrl}/doctors`);
        const doctors = res.data || [];

        const matchedDoctor = doctors.find((doc) => {
          const docEmail = (doc.email || "").trim().toLowerCase();
          const docPassword = doc.password || "";
          return (
            docEmail === trimmedEmail.toLowerCase() &&
            docPassword === trimmedPassword
          );
        });

        if (matchedDoctor) {
          const token = matchedDoctor.token || matchedDoctor.id;
          setDToken(token);
          setIsDoctorLoggedIn(true);
          setDoctorId(matchedDoctor.id);
          localStorage.setItem('dToken', token);
          localStorage.setItem('doctor', JSON.stringify(matchedDoctor));
          toast.success('Login successful');
          navigate('/doctor-dashboard');
        } else {
          toast.error('Doctor email not found or incorrect password');
        }
      }

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'>
          <span className='text-primary'>{state}</span> Login
        </p>
        <div className='w-full '>
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className='border border-[#DADADA] rounded w-full p-2 mt-1'
            type='email'
            required
          />
        </div>
        <div className='w-full '>
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className='border border-[#DADADA] rounded w-full p-2 mt-1'
            type='password'
            required
          />
        </div>
        <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
        {state === 'Admin' ? (
          <p>
            Doctor Login?{' '}
            <span onClick={() => setState('Doctor')} className='text-primary underline cursor-pointer'>
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin Login?{' '}
            <span onClick={() => setState('Admin')} className='text-primary underline cursor-pointer'>
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  )
}

export default Login
