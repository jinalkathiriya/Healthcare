import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL?.endsWith('/')
    ? import.meta.env.VITE_BACKEND_URL
    : import.meta.env.VITE_BACKEND_URL + '/';

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorData, setDoctorData] = useState(null);
  const [currency, setCurrency] = useState("₹");
  const [users, setUsers] = useState([]);

  const dToken = localStorage.getItem("dToken");
  const aToken = localStorage.getItem("aToken");

  const isDoctorLoggedIn = !!dToken;
  const isAdminLoggedIn = !!aToken;

  const loadDoctorProfileData = async (id) => {
    try {
      const token = localStorage.getItem("dToken");
      const doctorId = id || token?.split("-")[1];

      if (!doctorId) throw new Error("Invalid or missing doctor ID");

      console.log("Fetching profile for ID:", doctorId);
      const res = await axios.get(`${backendUrl}doctors/${doctorId}`);
      setDoctorData(res.data);
    } catch (error) {
      console.error("Unexpected error loading doctor profile", error);
      setDoctorData(null);
    }
  };

  
  const getAllDoctors = async () => {
    try {
      if (!isDoctorLoggedIn) return;

      const res = await axios.get(`${backendUrl}doctors`, {
        headers: {
          Authorization: `Bearer ${dToken}`,
        },
      });

      if (Array.isArray(res.data)) {
        const data = res.data.map(doc => ({
          ...doc,
          available: doc.available ?? true,
        }));
        setDoctors(data);
      } else {
        console.warn("⚠️ Unexpected doctor data format:", res.data);
        setDoctors([]);
      }
    } catch (err) {
      console.error("🔴 Failed to fetch doctors:", err.message);
      setDoctors([]);
    }
  };

  const getAllUsers = async () => {
    try {
      if (!isAdminLoggedIn) return;

      const res = await axios.get(`${backendUrl}/users`, {
        headers: {
          Authorization: `Bearer ${aToken}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("🔴 Failed to fetch users:", err.message);
    }
  };

  const slotDateFormat = (dateStr) => {
    if (!dateStr) return 'Invalid date';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';

    const day = date.getDate();
    const ordinal =
      day % 10 === 1 && day !== 11 ? "st" :
        day % 10 === 2 && day !== 12 ? "nd" :
          day % 10 === 3 && day !== 13 ? "rd" : "th";

    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    return `${day}${ordinal} ${month}, ${year}`;
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // ✅ Utility: Normalize user image (data URI or base64 or hosted)
  const getUserImage = (image) => {
    if (!image) return null;
    if (image.startsWith("data:image")) return image;
    if (image.startsWith("http")) return image;
    if (/^[A-Za-z0-9+/=]+$/.test(image)) return `data:image/jpeg;base64,${image}`;
    return null;
  };

  useEffect(() => {
    try {
      const storedAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
      setAppointments(storedAppointments);
      console.log("✅ Loaded appointments:", storedAppointments);
    } catch (err) {
      console.error("🔴 Error parsing appointments from localStorage:", err.message);
      setAppointments([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    if (isAdminLoggedIn) {
      getAllUsers();
    }

    if (isDoctorLoggedIn) {
      const storedDoctor = JSON.parse(localStorage.getItem("doctor"));
      const doctorId = storedDoctor?.id;
      if (doctorId) loadDoctorProfileData(doctorId);
    }

    if (isDoctorLoggedIn || isAdminLoggedIn) {
      fetchAppointmentsFromBackend();
    }
  }, [isDoctorLoggedIn, isAdminLoggedIn]);

  useEffect(() => {
    if (doctorData && appointments.length > 0) {
      const filteredAppointments = appointments.filter(
        (appt) => appt.doctorId === doctorData.id
      );
      console.log("📋 Filtered appointments for doctor:", filteredAppointments);
    }
  }, [doctorData, appointments]);

  const fetchAppointmentsFromBackend = async () => {
    try {
      const res = await axios.get(`${backendUrl}booked-appointment`);
      if (Array.isArray(res.data)) {
        setAppointments(res.data.reverse());
        localStorage.setItem("appointments", JSON.stringify(res.data));
        console.log("✅ Appointments fetched from backend:", res.data);
      } else {
        console.warn("⚠️ Unexpected appointment format:", res.data);
      }
    } catch (err) {
      console.error("🔴 Failed to fetch appointments:", err.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        doctors,
        setDoctors,
        getAllDoctors,
        appointments,
        setAppointments,
        slotDateFormat,
        doctorData,
        setDoctorData,
        dToken,
        loadDoctorProfileData,
        currency,
        calculateAge,
        users,
        getAllUsers,
        isDoctorLoggedIn,
        isAdminLoggedIn,
        fetchAppointmentsFromBackend,
        getUserImage, // ✅ Expose utility in context
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
