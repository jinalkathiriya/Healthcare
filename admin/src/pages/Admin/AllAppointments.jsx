import React, { useEffect, useState } from "react";
import axios from "axios";
import uploadImage from "../../assets/upload_area.svg";


const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// ✅ Date format normalizer
const formatToYMD = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  return date.toISOString().split("T")[0];
};

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showVisited, setShowVisited] = useState(false);
  const [showNotVisited, setShowNotVisited] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, usersRes, doctorRes] = await Promise.all([
          axios.get("http://localhost:5000/booked-appointment"),
          axios.get("http://localhost:5000/users"),
          axios.get("http://localhost:5000/doctors")
        ]);
        setAppointments(apptRes.data);
        setUsers(usersRes.data);
        setDoctors(doctorRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const getUserData = (id) => users.find((u) => u.id === id);
  const getDoctorData = (name) => doctors.find((d) => d.name === name);

  const handleAccept = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/booked-appointment/${id}`, {
        status: "accepted"
      });

      setAppointments(prev =>
        prev.map(appt =>
          appt.id === id ? { ...appt, status: "accepted" } : appt
        )
      );
    } catch (err) {
      console.error("Failed to accept appointment:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/booked-appointment/${id}`);
      setAppointments(prev => prev.filter(appt => appt.id !== id));
    } catch (err) {
      console.error("Failed to delete appointment", err);
    }
  };

  const normalizeDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-CA"); // ensures local date like '2025-04-10'
  };
  
  const filteredAppointments = appointments
    .filter((appt) => {
      const patientName = appt.patientName?.toLowerCase() || "";
      const doctorName = appt.doctorName?.toLowerCase() || "";
      const matchesSearch =
        patientName.includes(searchTerm.toLowerCase()) ||
        doctorName.includes(searchTerm.toLowerCase());
  
      const matchesDate =
        selectedDate === "" || normalizeDate(appt.date) === normalizeDate(selectedDate);
  
      const isVisited = appt.status === "accepted";
      const matchesVisited =
        (!showVisited && !showNotVisited) ||
        (showVisited && isVisited) ||
        (showNotVisited && !isVisited);
  
      return matchesSearch && matchesDate && matchesVisited;
    })
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`);
      const dateTimeB = new Date(`${b.date} ${b.time}`);
      return dateTimeA - dateTimeB;
    });
  


  return (
    <div className="p-6 w-full">
      <h2 className="text-xl font-semibold mb-4">All Appointments</h2>

      {/* Search, Date & Filters */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by patient or doctor name"
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <input
          type="date"
          className="w-full md:w-1/4 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        {/* ✅ Visited / Not Visited Checkboxes */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showVisited}
              onChange={(e) => setShowVisited(e.target.checked)}
            />
            Visited
          </label>

          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showNotVisited}
              onChange={(e) => setShowNotVisited(e.target.checked)}
            />
            Not Visited
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Patient</th>
              <th className="px-4 py-2">Age</th>
              <th className="px-4 py-2">Date & Time</th>
              <th className="px-4 py-2">Doctor</th>
              <th className="px-4 py-2">Fees</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt, index) => {
                const user = getUserData(appt.userId);
                const doctor = getDoctorData(appt.doctorName);
                return (
                  <tr key={index} className="border-t align-middle">
                    <td className="px-4 py-2">{index + 1}</td>

                    {/* Patient */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={user?.image || uploadImage}
                          alt="Patient"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <p className="font-medium">{appt.patientName || "N/A"}</p>
                      </div>
                    </td>

                    {/* Age */}
                    <td className="px-4 py-2">
                      {user?.dob ? calculateAge(user.dob) : user?.age || "N/A"}
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-2">{appt.date} | {appt.time}</td>

                    {/* Doctor */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={doctor?.image || uploadImage}
                          alt="Doctor"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <p>{appt.doctorName}</p>
                      </div>
                    </td>

                    {/* Fees */}
                    <td className="px-4 py-2">₹{appt.fees || "0"}</td>

                    {/* Action */}
                    <td className="px-4 py-2 flex gap-3">
                      {appt.status === "accepted" ? (
                        <span className="text-green-500">Visited</span>
                      ) : (
                        <>
                          <button
                            title="Accept"
                            className="text-green-600 text-lg hover:scale-110 transition"
                            onClick={() => handleAccept(appt.id)}
                          >
                            ✅
                          </button>

                          <button
                            title="Reject"
                            className="text-red-600 text-lg hover:scale-110 transition"
                            onClick={() => handleReject(appt.id)}
                          >
                            ❌
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-400">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllAppointments;
