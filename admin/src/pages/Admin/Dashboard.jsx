import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';

const Dashboard = () => {
  const {
    aToken,
    getDashData,
    getAllAppointments,
    cancelAppointment,
    dashData,
    appointments,
  } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!aToken) {
      navigate('/login');
    } else {
      getDashData();
      getAllAppointments();
    }
  }, [aToken, navigate]);

  const visitedCount = appointments?.filter(a => a.status === "accepted")?.length || 0;
  const notVisitedCount = appointments?.filter(a => a.status !== "accepted")?.length || 0;
  const unavailableDoctors = dashData.totalDoctors - dashData.availableDoctors;

  const patientsWithAppointments = new Set(appointments.map(appt => appt.userId));
  const bookedPatients = patientsWithAppointments.size;
  const notBookedPatients = dashData.patients - bookedPatients;

  return dashData && (
    <div className='m-5'>

      {/* 📊 DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: assets.doctor_icon, value: dashData.totalDoctors, label: "Doctors" },
          { icon: assets.doctor_icon, value: dashData.availableDoctors, label: "Available Doctors" },
          { icon: assets.doctor_icon, value: unavailableDoctors, label: "Unavailable Doctors" },
          { icon: assets.appointments_icon, value: dashData.appointments, label: "Appointments" },
          { icon: assets.appointments_icon, value: visitedCount, label: "Visited Appointments" },
          { icon: assets.appointments_icon, value: notVisitedCount, label: "Not Visited Appointments" },
          { icon: assets.patients_icon, value: dashData.patients, label: "Patients" },
          { icon: assets.patients_icon, value: bookedPatients, label: "Patients Booked Appointments" },
          { icon: assets.patients_icon, value: notBookedPatients, label: "Patients Not Booked Appointments" },
        ].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm min-h-[90px] transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5f6FFF';
              e.currentTarget.querySelectorAll('p').forEach(p => p.style.color = 'white');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.querySelectorAll('p').forEach(p => p.style.color = '');
            }}
          >
            <img className="w-10 h-10" src={item.icon} alt={item.label} />
            <div>
              <p className="text-1xl font-bold text-gray-700">{item.value}</p>
              <p className="text-lg text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='bg-white mt-10 rounded shadow'>
        <div className='flex items-center gap-2.5 px-6 py-4 border-b'>
          <img src={assets.list_icon} alt="List" />
          <p className='font-semibold text-lg'>Latest Bookings</p>
        </div>

        <div className='divide-y'>
          {(appointments || []).slice(0, 5).map((item, index) => {

            const doctorName = item?.doctorName || "Unknown Doctor";
            const doctorImage = item?.image || assets.default_profile;

            const patientName = item?.userData?.name || item.patientName || "Unknown Patient";
            const patientEmail = item?.userEmail || item?.userData?.email || "No Email";



            const appointmentDate = item.date || "Unknown Date";
            const appointmentTime = item.time || "Unknown Time";

            return (
              <div key={index} className='flex flex-col md:flex-row items-center justify-between px-6 py-4 gap-6 hover:bg-gray-50'>

                


                <div className='flex items-center gap-3 w-full md:w-1/3'>
                  <img className='w-10 h-10 rounded-full object-cover' src={doctorImage} alt="Doctor" />
                  <div className='text-sm'>
                    <p className='font-medium text-gray-800'>{doctorName}</p>
                    <p className='font-medium text-gray-800'>
                      {patientName} <span className="text-gray-500 text-xs">({patientEmail})</span>
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-3 w-full md:w-1/3'>
                  <div className='text-md'>
                    <p className='text-md text-gray-500'>Booked for {appointmentDate} at {appointmentTime}</p>
                  </div>
                </div>


                {/* Status */}
                <div className='w-full md:w-1/3 flex justify-end text-sm'>
                  {item.status === 'accepted' && (
                    <span className='text-green-500 font-semibold text-xs'>Accepted</span>
                  )}
                  {item.status === 'pending' && (
                    <span className='text-yellow-500 font-semibold text-xs'>Pending</span>
                  )}
                  {item.status === 'cancelled' && (
                    <span className='text-red-400 font-semibold text-xs'>Cancelled</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
