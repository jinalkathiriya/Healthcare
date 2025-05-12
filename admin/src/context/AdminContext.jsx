import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [users, setUsers] = useState([]); // ✅ NEW STATE

  const fetchDoctors = async () => {
    const res = await fetch(`${backendUrl}/doctors`, {
      headers: { aToken }
    });
    const data = await res.json();
    return data;
  };

  const fetchAppointments = async () => {
    const res = await fetch(`${backendUrl}/booked-appointment`, {
      headers: { aToken }
    });
    const data = await res.json();
    return data;
  };

  const fetchUsers = async () => {
    const res = await fetch(`${backendUrl}/users`, {
      headers: { aToken }
    });
    const data = await res.json();
    return data;
  };

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/doctors`, {
        headers: { aToken }
      });
      setDoctors(data);
    } catch (error) {
      toast.error("Failed to fetch doctors");
      console.error("getAllDoctors error:", error);
    }
  };

  const updateDoctor = async (id, payload) => {
    try {
      const response = await axios.put(`${backendUrl}/doctors/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${aToken}`,
          'Content-Type': 'application/json'
        }
      });
      toast.success("Doctor updated!");
      getAllDoctors();
    } catch (error) {
      toast.error("Update failed");
      console.error(error);
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const url = `${backendUrl}/admin/change-availability`;
      const { data } = await axios.post(
        url,
        { docId },
        {
          headers: {
            'Content-Type': 'application/json',
            aToken,
          }
        }
      );

      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message || "Failed to change availability");
      }
    } catch (error) {
      if (error.response) {
        console.error("Backend error:", error.response.status, error.response.data);
        toast.error(error.response.data.message || "Failed to change availability");
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server");
      } else {
        console.error("Request setup error:", error.message);
        toast.error("Network or config error");
      }
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/booked-appointment`, {
        headers: { aToken }
      });
  
      const formattedAppointments = data.reverse().map((item) => {
        const user = users.find(u => u._id === item.userId) || {};
        return {
          ...item,
          docData: item.docData || item.doctor || {},
          userData: user, // ✅ Attach full user object including image
        };
      });
  
      setAppointments(formattedAppointments);
      return formattedAppointments;
    } catch (error) {
      toast.error("Failed to fetch appointments");
      console.error("getAllAppointments error:", error);
    }
  };
  
  
  
  const cancelAppointment = async (appointmentId) => {
    try {
      await axios.delete(`${backendUrl}/appointments/${appointmentId}`, {
        headers: { aToken }
      });
      toast.success("Appointment cancelled");
      getAllAppointments();
    } catch (error) {
      toast.error("Failed to cancel appointment");
      console.error("cancelAppointment error:", error);
    }
  };

  const getAllUsers = async () => { // ✅ NEW FUNCTION
    try {
      const data = await fetchUsers();
      setUsers(data);
      return data;
    } catch (err) {
      toast.error("Failed to fetch users");
      console.error("getAllUsers error:", err);
    }
  };

  const getDashData = async () => {
    try {
      const doctors = await fetchDoctors();
      const appointments = await getAllAppointments();
      const users = await fetchUsers();

      const totalDoctors = doctors.length;
      const availableDoctors = doctors.filter(doc => doc.available).length;
      const totalAppointments = appointments.length;
      const patients = users.length;

      setDashData({
        totalDoctors,
        availableDoctors,
        appointments: totalAppointments,
        patients,
        latestAppointments: appointments.slice(0, 5)
      });

      setUsers(users); // ✅ Store users too
    } catch (err) {
      console.error("getDashData error:", err);
    }
  };

  const value = {
    backendUrl,
    aToken,
    setAToken,
    doctors,
    getAllDoctors,
    changeAvailability,
    updateDoctor,
    appointments,
    getAllAppointments,
    getDashData,
    cancelAppointment,
    dashData,
    users, // ✅ Provided in context
    getAllUsers, // ✅ Provided in context
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
