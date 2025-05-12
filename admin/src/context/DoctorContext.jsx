import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from "moment"; // make sure moment is installed

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem('dToken') || '');
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(!!localStorage.getItem('dToken'));
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);
  const [isDoctorDataLoading, setIsDoctorDataLoading] = useState(true);
  const [doctorId, setDoctorId] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]); // ✅ added this missing state

  useEffect(() => {
    const storedToken = localStorage.getItem('dToken');
    const storedDoctorStr = localStorage.getItem('doctor');

    if (storedToken && storedDoctorStr) {
      try {
        const storedDoctor = JSON.parse(storedDoctorStr);
        setDToken(storedToken);
        setIsDoctorLoggedIn(true);
        setProfileData(storedDoctor);
        setDoctorId(storedDoctor.id); // ✅ Correctly set doctor ID
      } catch (e) {
        console.error("❌ Failed to parse stored doctor:", e);
        localStorage.removeItem('doctor');
      }
    }
  }, []);

  useEffect(() => {
    if (dToken) {
      console.log("Fetching profile for token:", dToken);
      setProfileData(null);
      getProfileData();
    }
  }, [dToken]);

  const doctorLogin = async ({ email, password }) => {
    try {
      const res = await axios.post(`${backendUrl}/doctors/login`, { email, password });

      if (res.data.success) {
        const doctor = res.data.doctor;
        const token = res.data.token;

        localStorage.setItem('doctor', JSON.stringify(doctor));
        localStorage.setItem('dToken', token);

        setProfileData(doctor);
        setDToken(token);
        setDoctorId(doctor.id); // ✅ set the logged-in doctor's ID
        setIsDoctorLoggedIn(true);
        toast.success("Login successful");
        return { success: true };
      } else {
        toast.error(res.data.message || "Login failed");
        return { success: false };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password");
      return { success: false };
    }
  };

  const updateAppointmentDetails = async (appointmentId, data) => {
    try {
      const res = await axios.patch(`${backendUrl}/api/doctor/appointment/${appointmentId}`, data, {
        headers: { dToken }
      });
  
      if (res.data.success) {
        toast.success("Appointment updated");
        getAppointments();
      } else {
        toast.error(res.data.message || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Update appointment error:", error);
      toast.error("Error updating appointment");
    }
  };
  
  const getAppointments = async () => {
    try {
      if (!profileData || !profileData.id) {
        console.warn("🚫 profileData not available yet");
        return;
      }

      const res = await axios.get(`${backendUrl}/booked-appointment`);
      if (Array.isArray(res.data)) {
        const filtered = res.data.filter(apt => apt.doctorId === profileData.id);
        console.log("📦 All appointments fetched:", res.data);
        console.log("🎯 Filtered appointments:", filtered);
        setAppointments(filtered);
      } else {
        console.warn("⚠️ Unexpected appointment format:", res.data);
      }
    } catch (err) {
      console.error("❌ Failed to fetch appointments", err);
    }
  };

  const getProfileData = async () => {
    try {
      if (!dToken) return;

      const storedDoctor = JSON.parse(localStorage.getItem("doctor"));
      const storedEmail = storedDoctor?.email;

      if (!storedEmail) {
        toast.error("Doctor email not found");
        return;
      }

      const res = await axios.get(`${backendUrl}/doctors`, {
        headers: { dToken }
      });

      const doctors = res.data;
      const currentDoctor = doctors.find(doc => doc.email === storedEmail);

      if (!currentDoctor) {
        toast.error("Doctor not found");
        return;
      }

      setDoctorId(currentDoctor.id); // ✅ Save ID into state
      setProfileData(currentDoctor);
      localStorage.setItem('doctor', JSON.stringify(currentDoctor)); // ✅ Refresh local storage
    } catch (error) {
      console.error("Failed to fetch doctor profile", error);
      toast.error("Error fetching doctor profile");
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/cancel-appointment`, { appointmentId }, {
        headers: { dToken }
      });
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/complete-appointment`, { appointmentId }, {
        headers: { dToken }
      });
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${backendUrl}/doctors`);
      const docs = res.data.map(doc => ({
        ...doc,
        available: doc.available ?? true,
      }));
      setAllDoctors(docs);
      return docs;
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      toast.error("Unable to load doctors");
      return [];
    }
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${backendUrl}/users`);
    return res.data;
  };

  const getAllAppointments = async () => {
    const res = await axios.get(`${backendUrl}/booked-appointment`);
    return res.data.reverse();
  };

  const getDashData = async () => {
    try {
      const allAppointments = await getAllAppointments();
      const users = await fetchUsers();

      const currentDoctor = JSON.parse(localStorage.getItem("doctor"));
      const doctorId = currentDoctor?.id;

      const doctorAppointments = allAppointments.filter(appt => appt.doctorId === doctorId);

      const earnings = doctorAppointments.reduce((sum, appt) => {
        const isValidForEarnings =
          appt.status?.toLowerCase() === 'accepted' ||
          appt.status?.toLowerCase() === 'visited' ||
          appt.completed === true ||
          appt.isCompleted === true;

        const fee = parseFloat(appt.fees ?? appt.fee ?? appt.amount ?? 0);
        return isValidForEarnings ? sum + fee : sum;
      }, 0);

      const totalAppointments = doctorAppointments.length;

      const uniquePatientIds = new Set(
        doctorAppointments.map(appt =>
          typeof appt.userId === 'object' ? appt.userId.id : appt.userId
        )
      );
      const patients = uniquePatientIds.size;

      const latestAppointments = doctorAppointments
        .sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time))
        .slice(0, 5)
        .map(appt => {
          const user =
            typeof appt.userId === "object"
              ? appt.userId
              : users.find(u => u.id === appt.userId);

          const formattedDate = moment(`${appt.date} ${appt.time}`, "ddd MMM DD YYYY hh:mm A").isValid()
            ? moment(`${appt.date} ${appt.time}`, "ddd MMM DD YYYY hh:mm A").format("MMMM Do YYYY, h:mm A")
            : "Unknown date";

          return {
            ...appt,
            formattedDate,
            userData: user
              ? {
                name: user.name || appt.patientName || "Unknown",
                image: user.image || null,
                email: user.email || appt.userEmail || "N/A",
              }
              : {
                name: appt.patientName || "Unknown",
                email: appt.userEmail || "N/A",
                image: null,
              },
          };
        });

      setDashData({
        earnings,
        appointments: totalAppointments,
        patients,
        latestAppointments,
      });
    } catch (error) {
      console.error("Dashboard fetch error:", {
        status: error?.response?.status,
        message: error?.message,
        url: error?.config?.url,
      });
      throw error;
    }
  };

  const updateProfileData = async (updatedData) => {
    try {
      const doctor = JSON.parse(localStorage.getItem("doctor"));
      if (!doctor?.id) {
        toast.error("Doctor ID not found");
        return;
      }

      const res = await axios.put(`${backendUrl}/doctors/${doctor.id}`, updatedData, {
        headers: { dToken }
      });

      if (res.status === 200) {
        toast.success("Profile updated successfully");
        getProfileData();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Error updating profile");
    }
  };

  const getDoctorById = async (id) => {
    const res = await axios.get(`${backendUrl}/doctors/${id}`, {
      headers: {
        Authorization: `Bearer ${dToken}`
      }
    });
    return res.data;
  };

  const fetchDoctorProfileById = async (id) => {
    try {
      const res = await axios.get(`${backendUrl}/doctors/${id}`, {
        headers: {
          Authorization: `Bearer ${dToken}`
        }
      });
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch doctor with ID ${id}:`, error);
      toast.error("Unable to fetch doctor profile");
      return null;
    }
  };

  const value = {
    dToken, setDToken,
    isDoctorLoggedIn, setIsDoctorLoggedIn,
    backendUrl,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    dashData, getDashData,
    profileData, setProfileData,
    getProfileData,
    updateProfileData,
    isDoctorDataLoading,
    doctorId, setDoctorId,
    doctorLogin,
    allDoctors, fetchDoctors,
    getDoctorById,
    fetchDoctorProfileById,
    doctorData: profileData, // ✅ Add this line to expose as 'doctorData'
    updateAppointmentDetails // ✅ newly added function

  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
