import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import html2pdf from 'html2pdf.js';

const MyAppointments = () => {
  const { cancelAppointment, userData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchDateTime, setSearchDateTime] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (userData?.id) {
      fetch(`http://localhost:5000/booked-appointment?userId=${userData.id}`)
        .then(res => res.json())
        .then(data => setAppointments(data))
        .catch(err => console.error("Failed to fetch appointments:", err));
    }
  }, [userData]);

  useEffect(() => {
    fetch('http://localhost:5000/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data));
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const getDoctor = (doctorName) => {
    return doctors.find(doc => doc.name === doctorName);
  };

  const getDoctorAddress = (doctorName) => {
    const doctor = getDoctor(doctorName);
    return doctor?.address ? (
      <div className="text-xs">
        <p>{doctor.address.line1}</p>
        <p>{doctor.address.line2}</p>
      </div>
    ) : (
      <div className="text-xs italic text-gray-400">No address available</div>
    );
  };

  const getUserInfo = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? (
      <>
        <p><strong>Patient:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </>
    ) : <p className="text-xs italic text-gray-400">User not found</p>;
  };

  
const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
}
  

  const filteredAppointments = [...appointments]
    .sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`))
    .filter(item =>
      item.doctorName.toLowerCase().includes(searchName.toLowerCase()) &&
      `${item.date} ${item.time}`.toLowerCase().includes(searchDateTime.toLowerCase()) &&
      (statusFilter === 'all' || (statusFilter === 'visited' ? item.status === 'accepted' : item.status !== 'accepted'))
    );

  const openPrescriptionModal = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const closePrescriptionModal = () => {
    setSelectedAppointment(null);
  };

  const pdfRefs = useRef({});

  const handleDownloadPDF = (id) => {
    const pdfContent = pdfRefs.current[id];
    if (pdfContent) {
      html2pdf().from(pdfContent).save(`Appointment-${id}.pdf`);
    }
  };

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My appointment</p>

      <div className="flex flex-wrap gap-4 items-center mb-4 mt-4">
        <input
          type="text"
          placeholder="Search by doctor name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border px-3 py-1 text-sm rounded"
        />
        <input
          type="text"
          placeholder="Search by date or time"
          value={searchDateTime}
          onChange={(e) => setSearchDateTime(e.target.value)}
          className="border px-3 py-1 text-sm rounded"
        />
        <button onClick={() => setStatusFilter('visited')} className={`text-sm px-3 py-1 border rounded ${statusFilter === 'visited' ? 'bg-green-100 text-green-700 border-green-500' : ''}`}>
          Visited
        </button>
        <button onClick={() => setStatusFilter('not-visited')} className={`text-sm px-3 py-1 border rounded ${statusFilter === 'not-visited' ? 'bg-yellow-100 text-yellow-700 border-yellow-500' : ''}`}>
          Not Visited
        </button>
        <button onClick={() => setStatusFilter('all')} className={`text-sm px-3 py-1 border rounded ${statusFilter === 'all' ? 'bg-gray-100 text-gray-700 border-gray-400' : ''}`}>
          All
        </button>
      </div>

      <div>
        {filteredAppointments.map((item, index) => {
          const doctor = getDoctor(item.doctorName);
          const user = users.find(u => u.id === item.userId);

          return (
            <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b'>
              <div>
                <img className='w-32 bg-indigo-50' src={item.image} alt="" />
              </div>
              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.doctorName}</p>
                <p>{item.speciality}</p>
                <div className='text-zinc-700 font-medium mt-1'>Address:</div>
                {getDoctorAddress(item.doctorName)}
                <p className='text-xs mt-1'>
                  <span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {item.date} | {item.time}
                </p>
                <div className="mt-2">{getUserInfo(item.userId)}</div>
              </div>

              {/* Hidden content for PDF */}
              <div style={{ display: 'none' }}>
                <div ref={(el) => (pdfRefs.current[item.id] = el)} className="p-4 text-sm text-black bg-white max-w-md">
                  <h2 className="text-lg font-semibold mb-2">Appointment Summary</h2>
                  <p><strong>Doctor:</strong> {item.doctorName}</p>
                  <p><strong>Speciality:</strong> {doctor?.speciality || 'N/A'}</p>
                  <p><strong>Patient:</strong> {user?.name || 'Unknown'}</p>
                  <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                  <p><strong>Date:</strong> {item.date}</p>
                  <p><strong>Time:</strong> {item.time}</p>
                  <p><strong>Prescription:</strong> {item.prescription || 'N/A'}</p>
                  <p><strong>Report:</strong> {item.report || 'N/A'}</p>
                  <div>
                    <strong>Address:</strong>
                    {getDoctorAddress(item.doctorName)}
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-2 justify-end'>
                {item.status === "accepted" ? (
                  <>
                    <button className='text-sm text-white bg-green-600 border border-green-600 py-2 sm:min-w-48 cursor-default'>
                      Visited
                    </button>
                    <button
                      onClick={() => openPrescriptionModal(item)}
                      className='text-sm text-blue-600 border border-blue-600 py-2 text-center sm:min-w-48 hover:bg-blue-600 hover:text-white transition-all duration-300'
                    >
                      View Prescription
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(item.id)}
                      className='text-sm text-red-600 border border-red-600 py-2 sm:min-w-48 hover:bg-red-600 hover:text-white transition-all duration-300'
                    >
                      Download PDF
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => cancelAppointment(item, index)}
                    className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300'
                  >
                    Cancel appointment
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedAppointment && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[90%] max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Prescription Details</h2>
            <p><strong>Doctor:</strong> {selectedAppointment.doctorName}</p>
            <p><strong>Speciality:</strong> {getDoctor(selectedAppointment.doctorName)?.speciality || 'N/A'}</p>
            <p><strong>Patient:</strong> {users.find(u => u.id === selectedAppointment.userId)?.name || 'Unknown'}</p>
            <p><strong>Email:</strong> {users.find(u => u.id === selectedAppointment.userId)?.email || 'N/A'}</p>
            <p><strong>Date:</strong> {selectedAppointment.date}</p>
            <p><strong>Address:</strong> {getDoctorAddress(selectedAppointment.doctorName)}</p>
            <p><strong>Your Prescription:</strong> {selectedAppointment.prescription || 'N/A'}</p>
            <p><strong>Report:</strong> {selectedAppointment.report || 'None'}</p>

            <div className="flex justify-end mt-4">
              <button onClick={closePrescriptionModal} className="border px-4 py-1 mr-2 rounded text-blue-600 hover:bg-blue-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
