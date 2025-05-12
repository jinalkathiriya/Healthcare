import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const {
    dToken,
    setDToken,
    dashData,
    getDashData,
    cancelAppointment,
    completeAppointment,
    appointments,
  } = useContext(DoctorContext);
  const { slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('dToken');

    if (tokenFromStorage && tokenFromStorage !== dToken) {
      setDToken(tokenFromStorage);
    }

    if (tokenFromStorage) {
      getDashData().catch((err) => {
        console.error("Dashboard fetch error: ", {
          status: err?.response?.status,
          message: err?.message,
          url: err?.config?.url,
        });
        toast.error("Failed to fetch dashboard data.");
      });
    } else {
      navigate('/login');
    }
    // eslint-disable-next-line
  }, [dToken]);

  if (!dToken || !dashData) return null;

  const earningsFormatted = `${currency} ${Number(dashData.earnings || 0).toFixed(2)}`;

  const visitedCount = Array.isArray(appointments)
    ? appointments.filter(a => a.status === 'accepted' || a.completed || a.isCompleted).length
    : 0;

  const notVisitedCount = Array.isArray(appointments)
    ? appointments.filter(a => !a.cancelled && !(a.status === 'accepted' || a.completed || a.isCompleted)).length
    : 0;

  const patientsWithAppointments = new Set((appointments || []).map(appt => appt.userId));
  const bookedPatients = patientsWithAppointments.size;

  return (
    <div className="m-5">
      {/* ✅ Doctor Welcome Message */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome, {dashData?.doctorName || 'Doctor'}!
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <DashboardCard icon={assets.earning_icon} title="Earnings" value={earningsFormatted} />
        <DashboardCard icon={assets.appointments_icon} title="Appointments" value={dashData.appointments} />
        <DashboardCard icon={assets.patients_icon} title="Patients" value={dashData.patients} />
        <DashboardCard icon={assets.appointments_icon} title="Visited Patients" value={visitedCount} />
        <DashboardCard icon={assets.appointments_icon} title="Not Visited Patients" value={notVisitedCount} />
      </div>

      <div className='bg-white'>
        <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>

        <div className='pt-4 border border-t-0'>
          {(dashData.latestAppointments || [])
            .map((item, index) => {
              const userName = item?.userData?.name || item?.patientName || "Unknown";
              const userImage = item?.userData?.image || assets.default_profile;
              const bookingDate = item?.slotDate || item?.date || null;

              return (
                <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
                  <img
                    className='rounded-full w-10'
                    src={userImage}
                    alt="User"
                  />
                  <div className='flex-1 text-sm'>
                    <p className='text-gray-800 font-medium'>
                      {userName}
                    </p>
                    <p className='text-gray-600'>
                      Booking on {bookingDate ? slotDateFormat(bookingDate) : "Unknown date"}
                    </p>
                  </div>
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

const DashboardCard = ({ icon, title, value }) => (
  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm min-h-[90px] cursor-pointer transition-all duration-300 hover:bg-[#5f6FFF] group  hover:shadow-md hover:-translate-y-1 group">
    <img className='w-14' src={icon} alt="" />
    <div>
      <p className='text-xl font-semibold text-gray-600 group-hover:text-white'>{value}</p>
      <p className='text-gray-400 group-hover:text-white'>{title}</p>
    </div>
  </div>
);

export default DoctorDashboard;
