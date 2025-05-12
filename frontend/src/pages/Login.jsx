import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ToastContainer, toast } from 'react-toastify'; // ✅ import toastify
import 'react-toastify/dist/ReactToastify.css'; // ✅ import styles

const Login = () => {
  const [state, setState] = useState('Sign Up');
  const [email, setEMail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { setUserData, setToken, loadUserProfileData, backendUrl } = useContext(AppContext);

  const notify = (msg) => toast.success(msg); // ✅ reusable success toast

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (state === 'Sign Up') {
        const checkRes = await fetch(`${backendUrl}/users?email=${email}`);
        const existing = await checkRes.json();
        if (existing.length > 0) {
          throw new Error("Email already exists. Please use a different one.");
        }

        const res = await fetch(`${backendUrl}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          throw new Error("Registration failed");
        }

        const loginRes = await fetch(`${backendUrl}/users?email=${email}&password=${password}`);
        const users = await loginRes.json();

        if (users.length > 0) {
          const user = users[0];
          const fakeToken = `token-${user.id}-${Date.now()}`;
          setToken(fakeToken);
          localStorage.setItem("token", fakeToken);
          setUserData(user);
          notify("Registration successful! Logging you in...");
          setTimeout(() => navigate("/"), 1500);
        } else {
          throw new Error("Auto-login failed after registration");
        }

      } else {
        const res = await fetch(`${backendUrl}/users?email=${email}&password=${password}`);
        const users = await res.json();

        if (users.length > 0) {
          const user = users[0];
          const fakeToken = `token-${user.id}-${Date.now()}`;
          setToken(fakeToken);
          localStorage.setItem("token", fakeToken);
          setUserData(user);
          notify("Login successful!");
          setTimeout(() => navigate("/"), 1500);
        } else {
          throw new Error("Invalid email or password");
        }
      }
    } catch (err) {
      console.error(err.message);
      toast.error(err.message); // ✅ show error using toast
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
        <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
          <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
          <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>
          {
            state === 'Sign Up' && 
            <div className='w-full'>
              <p>Full Name</p>
              <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e) => setName(e.target.value)} value={name} required />
            </div>
          }
          <div className='w-full'>
            <p>Email</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e) => setEMail(e.target.value)} value={email} required />
          </div>
          <div className='w-full'>
            <p>Password</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" onChange={(e) => setPassword(e.target.value)} value={password} required />
          </div>
          <button type='submit' className='bg-primary hover:bg-indigo-600 transition text-white w-full py-2 rounded-md text-base'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</button>
          {
            state === 'Sign Up'
              ? <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary cursor-pointer underline'>Login here</span></p>
              : <p>Create a new account? <span onClick={() => setState('Sign Up')} className='text-primary cursor-pointer underline'>click here</span></p>
          }
        </div>
      </form>
    </>
  );
};

export default Login;
