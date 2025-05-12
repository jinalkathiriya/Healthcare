import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom' // ✅ Added useNavigate
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate() // ✅ Added this line
  const { doctors, currencySymbol } = useContext(AppContext)

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc.id === docId)
    setDocInfo(docInfo)
  }

  const getAvailableSlots = async () => {
    setDocSlots([])
    let today = new Date()

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      let endTime = new Date()
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(today.getHours() > 10 ? today.getHours() + 1 : 10)
        currentDate.setMinutes(today.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        
        timeSlots.push({
          dateTime: new Date(currentDate),
          time: formattedTime
        })
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      setDocSlots(prev => ([...prev, timeSlots]))
    }
  }

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    getAvailableSlots()
  }, [docInfo])

  const { userData, addAppointment } = useContext(AppContext); // ✅ make sure currentUser is pulled

  const handleBooking = async () => {
    if (!slotTime) return toast.error("⛔ Please select a time slot.");
  
    const selectedSlot = docSlots[slotIndex].find(slot => slot.time === slotTime);
    if (!selectedSlot) return toast.error("⛔ Invalid time selected.");
  
    const appointment = {
      userId: userData?.id || "guest",
      patientName: userData?.name || "John Doe",
      userEmail: userData?.email || "guest@example.com",
      doctorId: docInfo.id,
      doctorName: docInfo.name,
      image: docInfo.image,
      speciality: docInfo.speciality,
      fees: docInfo.fees,
      date: selectedSlot.dateTime.toDateString(),
      time: slotTime,
      status: "pending"
    }
    
  
    try {
      const res = await fetch("http://localhost:5000/booked-appointment");
      const bookedAppointments = await res.json();
  
      const isSlotTaken = bookedAppointments.some(
        appt =>
          appt.doctorId === appointment.doctorId &&
          appt.date === appointment.date &&
          appt.time === appointment.time
      );
  
      if (isSlotTaken) {
        return toast.error("⚠️ This time slot is already booked.");
      }
  
      addAppointment(appointment);
  
      await fetch("http://localhost:5000/booked-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment)
      });
  
      toast.success("✅ Appointment booked!");
      setTimeout(() => navigate("/my-appointments"), 1000);
  
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("❌ Failed to book. Try again.");
    }
  };
  
  

  return docInfo && (
    <div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/*----------Doctor Details---------------*/}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee:
            <span className='text-gray-600'> {currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/*----------Booking Slots---------------*/}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>

        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item, index) => (
              <div onClick={() => setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-100 transition'}`} key={index}>
                <p>{item[0] && daysOfWeek[item[0].dateTime.getDay()]}</p>
                <p>{item[0] && item[0].dateTime.getDate()}</p>
              </div>
            ))
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length && docSlots[slotIndex].map((item, index) => (
            <p
              onClick={() => setSlotTime(item.time)}
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer transition-all duration-200
              ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300 hover:bg-gray-100'}`}
              key={index}
            >
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>

        {/* Book Button with hover effect */}
        <button
          onClick={handleBooking}
          className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6 hover:bg-white hover:text-primary border transition duration-300'
        >
          Book an appointment
        </button>
      </div>

      {/*----------Related Doctors Section---------------*/}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointment
