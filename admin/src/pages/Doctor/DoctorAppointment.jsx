import React, { useContext, useEffect, useState, useMemo } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import axios from 'axios'
import uploadImage from "../../assets/upload_area.svg"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Typography,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  Modal,
  Box,
  Button
} from '@mui/material';

const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    doctorData,
    allDoctors, // ✅ Correctly moved inside the component
  } = useContext(DoctorContext);

  const { slotDateFormat, calculateAge, currency, users, getAllUsers } = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [showVisited, setShowVisited] = useState(false)
  const [showNotVisited, setShowNotVisited] = useState(false)

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [selectedReport, setSelectedReport] = useState("");

  const reportOptions = ["Blood Test", "X-Ray", "MRI", "ECG"];

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  useEffect(() => {
    if (users.length === 0 && dToken) {
      getAllUsers();
    }
  }, [users]);

  const normalizeDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-CA")
  }

  const doctorAppointments = useMemo(() => {
    if (!doctorData?.id || !Array.isArray(appointments) || !Array.isArray(users)) return [];

    return appointments
      .filter(appt => String(appt.doctorId) === String(doctorData.id))
      .filter((appt) => {
        const patient = users.find(u => u.id === appt.userId) || {};
        const patientName = (patient.name || appt.patientName || '').toLowerCase();
        const matchesSearch = patientName.includes(searchTerm.toLowerCase());

        const matchesDate = selectedDate === "" || normalizeDate(appt.date) === normalizeDate(selectedDate);

        const isVisited = appt.status === "accepted";
        const isNotVisited = appt.status !== "accepted";
        const matchesVisited =
          (!showVisited && !showNotVisited) ||
          (showVisited && isVisited) ||
          (showNotVisited && isNotVisited);

        return matchesSearch && matchesDate && matchesVisited;
      })
      .sort((a, b) => {
        const dateTimeA = new Date(`${a.date} ${a.time}`);
        const dateTimeB = new Date(`${b.date} ${b.time}`);
        return dateTimeA - dateTimeB;
      });
  }, [appointments, users, doctorData, searchTerm, selectedDate, showVisited, showNotVisited]);

  const handleAccept = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/booked-appointment/${id}`, {
        status: 'accepted'
      })
      getAppointments()
    } catch (err) {
      console.error("Failed to accept appointment:", err)
    }
  }

  const handleReject = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/booked-appointment/${id}`)
      getAppointments()
    } catch (err) {
      console.error("Failed to delete appointment", err)
    }
  }

  const openPrescriptionModal = (appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionText(appointment.prescription || "");
    setSelectedReport(appointment.report || "");
    setShowPrescriptionModal(true);
  };

  const closeModal = () => {
    setShowPrescriptionModal(false);
    setSelectedAppointment(null);
    setPrescriptionText("");
    setSelectedReport("");
  };

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search patient"
          className="p-2 border rounded-md w-full md:w-1/3 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="date"
          className="p-2 border rounded-md text-sm"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <div className="flex gap-4 text-sm">
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

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll '>
        <div className='max-sm:hidden grid grid-cols-[1fr_1fr_1fr_3fr_2fr_2fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Date & Time</p>
          <p>Prescription</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {doctorAppointments.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No appointments found.</div>
        ) : doctorAppointments.map((item, index) => {
          const patient = users.find(u => u.id === item.userId) || {};
          const doctor = allDoctors.find(doc => doc.id === item.doctorId) || {};
          const imageUrl = (() => {
            if (!patient.image) return uploadImage;
            if (patient.image.startsWith("data:image")) return patient.image;
            if (/^[A-Za-z0-9+/=]+$/.test(patient.image)) return `data:image/jpeg;base64,${patient.image}`;
            if (patient.image.startsWith("http")) return patient.image;
            return uploadImage;
          })();

          return (
            <div
              className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[1fr_1fr_1fr_3fr_2fr_2fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'
              key={index}
            >
              <p className='max-sm:hidden'>{index + 1}</p>

              <div className='flex items-center gap-2'>
                
                <p>{patient.name || item.patientName || 'Unknown'}</p>
              </div>

              <div>
                <p className='text-xs inline border border-primary px-2 rounded-full'>
                  {item.payment ? 'Online' : 'CASH'}
                </p>
              </div>

              
              <p>{item.date}, {item.time}</p>

              <div>
                {item.prescription ? (
                  <div className="flex flex-col items-start gap-y-1">
                    <p className="text-green-600 text-xs font-medium px-3 py-1 rounded-full border border-green-600 hover:bg-green-50 transition">
                      Prescribed
                    </p>
                    <button
                      onClick={() => openPrescriptionModal(item)}
                      className="text-xs font-medium px-3 py-1 rounded-full border text-blue-600 border-blue-600 hover:bg-blue-50 transition"
                    >
                      View/Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openPrescriptionModal(item)}
                    className="text-xs font-medium px-3 py-1 rounded-full border text-blue-600 border-blue-600 hover:bg-blue-50 transition"
                  >
                    Add Prescription
                  </button>
                )}
              </div>

              <p>{currency}{item.fees}</p>

              {item.status === 'cancelled' ? (
                <p className='text-red-400 text-xs font-medium'>Cancelled</p>
              ) : item.status === 'accepted' ? (
                <p className='text-green-500 text-xs font-medium'>Visited</p>
              ) : (
                <div className='flex gap-2'>
                  <button
                    title="Accept"
                    className="text-green-600 text-lg hover:scale-110 transition"
                    onClick={() => handleAccept(item.id)}
                  >
                    ✅
                  </button>
                  <button
                    title="Reject"
                    className="text-red-600 text-lg hover:scale-110 transition"
                    onClick={() => handleReject(item.id)}
                  >
                    ❌
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        open={showPrescriptionModal}
        onClose={closeModal}
        aria-labelledby="prescription-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            width: '90%',
            maxWidth: 500,
          }}
        >
          <Typography id="prescription-modal-title" variant="h6" component="h2" mb={2}>
            Prescription Details
          </Typography>

          {selectedAppointment && (
            <>
              <Typography variant="body2" mb={1}>
                <strong>Doctor:</strong> {selectedAppointment.doctorName || 'N/A'}
              </Typography>

              {(() => {
                const patient = users.find(u => u.id === selectedAppointment?.userId);
                const doctor = allDoctors.find(doc => doc.id === selectedAppointment?.doctorId);

                return (
                  <>
                    <Typography variant="body2" mb={1}>
                      <strong>Patient:</strong> {patient?.name || selectedAppointment?.patientName || 'Unknown'}
                    </Typography>
                    
                  </>
                );
              })()}

              <Typography variant="body2" mb={2}>
                <strong>Date:</strong> {selectedAppointment.date}
              </Typography>
              <Typography variant="body2" mb={2}>
                <strong>Address:</strong> {doctorData?.address?.line1 || ''} {doctorData?.address?.line2 || ''}
              </Typography>

              <TextField
                label="Prescription"
                fullWidth
                multiline
                rows={3}
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!selectedReport}
                    onChange={(e) =>
                      setSelectedReport(e.target.checked ? reportOptions[0] : "")
                    }
                  />
                }
                label="Required for Report?"
              />

              {selectedReport && (
                <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                  <InputLabel id="report-label">Report Type</InputLabel>
                  <Select
                    labelId="report-label"
                    id="report-select"
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    label="Report Type"
                  >
                    {reportOptions.map((opt, idx) => (
                      <MenuItem key={idx} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                <Button onClick={closeModal} variant="outlined" size="small">Close</Button>
                <Button
                  onClick={async () => {
                    try {
                      await axios.patch(`http://localhost:5000/booked-appointment/${selectedAppointment.id}`, {
                        prescription: prescriptionText,
                        report: selectedReport || null,
                      });
                      getAppointments();
                      closeModal();
                    } catch (err) {
                      console.error("Failed to save prescription:", err);
                    }
                  }}
                  variant="contained"
                  size="small"
                >
                  Send
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
