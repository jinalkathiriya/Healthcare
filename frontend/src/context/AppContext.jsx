import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // ✅ NEW: trigger for refreshing appointments
  const [refreshAppointments, setRefreshAppointments] = useState(false);

  const isAuthenticated = !!token; // ✅ Added authentication flag

  const loadUserProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = token?.split("-")[1];

      if (!userId) throw new Error("Invalid token format");

      const { data } = await axios.get(`${backendUrl}/users/${userId}`);
      setUserData(data);
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setUserData(null);
    }
  };

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/doctors`);
      setDoctors(data);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  const addAppointment = (appointment) => {
    const updated = [...appointments, appointment];
    setAppointments(updated);
    localStorage.setItem("appointments", JSON.stringify(updated));
    setRefreshAppointments(prev => !prev); // ✅ trigger re-fetch
  };

  const cancelAppointment = (index) => {
    const updated = appointments.filter((_, i) => i !== index);
    setAppointments(updated);
    localStorage.setItem("appointments", JSON.stringify(updated));
    setRefreshAppointments(prev => !prev); // ✅ trigger re-fetch
  };

  useEffect(() => {
    getAllDoctors();

    const stored = localStorage.getItem("appointments");
    if (!token && stored) {
      setAppointments(JSON.parse(stored));
    }

    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = token?.split("-")[1];

        if (!userId) throw new Error("Invalid token format");

        const res = await axios.get(`${backendUrl}/booked-appointment`);
        if (Array.isArray(res.data)) {
          const userAppointments = res.data.filter(
            (appt) => String(appt.userId) === String(userId)
          );
          setAppointments(userAppointments);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        console.error("Failed to fetch backend appointments:", err);
        setAppointments([]);
      }
    };

    if (token) {
      loadUserProfileData();
      fetchAppointments();
    }
  }, [token, refreshAppointments]); // ✅ listen to refreshAppointments

  return (
    <AppContext.Provider
      value={{
        backendUrl,
        token,
        doctors,
        getAllDoctors,
        appointments,
        addAppointment,
        cancelAppointment,
        userData,
        setUserData,
        loadUserProfileData,
        setToken,
        isAuthenticated, // ✅ Added here
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
