import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors, updateDoctor } = useContext(AdminContext)

  const [editStates, setEditStates] = useState({})

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  const toggleEdit = (id) => {
    setEditStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const [localDoctors, setLocalDoctors] = useState({})

  useEffect(() => {
    const initialState = {}
    doctors.forEach(doc => {
      initialState[doc.id] = { ...doc }
    })
    setLocalDoctors(initialState)
  }, [doctors])

  const handleImageChange = (e, id) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLocalDoctors(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            image: reader.result
          }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (id, field, value) => {
    setLocalDoctors(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  const handleSave = (id) => {
    const updated = localDoctors[id]
    updateDoctor(id, updated) // You should implement this in AdminContext
    toggleEdit(id)
  }

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium'>All Doctors</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {doctors.map((item) => {
          const isEdit = editStates[item.id]
          const localData = localDoctors[item.id] || item

          return (
            <div className='border border-[#C9D8FF] rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={item.id}>
              <img className='bg-[#EAEFFF] group-hover:bg-primary transition-all duration-500 w-full h-36 object-cover' src={localData.image} alt="" />
              {isEdit && (
                <input type="file" accept="image/*" className='p-1' onChange={(e) => handleImageChange(e, item.id)} />
              )}
              <div className='p-4'>
                <div className='flex items-center gap-1 text-sm mb-1'>
                  <span className={`w-2 h-2 rounded-full ${localData.available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <p className={`transition-colors duration-200 ${localData.available ? 'text-green-600' : 'text-gray-500'}`}>
                    {localData.available ? 'Available' : 'Unavailable'}
                  </p>
                </div>

                {isEdit ? (
                  <>
                    <input
                      type="text"
                      value={localData.name}
                      onChange={(e) => handleInputChange(item.id, 'name', e.target.value)}
                      className='text-[#262626] text-sm font-medium border w-full mb-1 p-1'
                    />
                    <input
                      type="text"
                      value={localData.speciality}
                      onChange={(e) => handleInputChange(item.id, 'speciality', e.target.value)}
                      className='text-[#5C5C5C] text-sm border w-full mb-1 p-1'
                    />
                    <input
                      type="text"
                      value={localData.degree}
                      onChange={(e) => handleInputChange(item.id, 'degree', e.target.value)}
                      className='text-sm border w-full mb-1 p-1'
                    />
                    <input
                      type="text"
                      value={localData.experience}
                      onChange={(e) => handleInputChange(item.id, 'experience', e.target.value)}
                      className='text-sm border w-full mb-1 p-1'
                    />
                    <input
                      type="number"
                      value={localData.fees}
                      onChange={(e) => handleInputChange(item.id, 'fees', e.target.value)}
                      className='text-sm border w-full mb-1 p-1'
                    />
                    <input
                      type="email"
                      value={localData.email}
                      onChange={(e) => handleInputChange(item.id, 'email', e.target.value)}
                      className='text-sm border w-full mb-1 p-1'
                      placeholder='Email'
                    />
                    <input
                      type="text"
                      value={localData.password}
                      onChange={(e) => handleInputChange(item.id, 'password', e.target.value)}
                      className='text-sm border w-full mb-1 p-1'
                      placeholder='Password'
                    />
                    <textarea
                      value={localData.about}
                      onChange={(e) => handleInputChange(item.id, 'about', e.target.value)}
                      className='text-sm border w-full mb-2 p-1'
                      rows={2}
                    />
                  </>
                ) : (
                  <>
                    <p className='text-[#262626] text-lg font-medium'>{localData.name}</p>
                    <p className='text-[#5C5C5C] text-sm'>{localData.speciality}</p>
                    <p className='text-[#5C5C5C] text-sm'>{localData.email}</p>
                  </>
                )}

                <div className='mt-2 flex items-center gap-3 text-sm'>
                  <label className='flex items-center gap-1 cursor-pointer'>
                    <input
                      type="radio"
                      name={`availability-${item.id}`}
                      checked={localData.available}
                      onChange={() => handleInputChange(item.id, 'available', true)}
                      disabled={!isEdit}
                    />
                    <span className={`ml-1 ${localData.available ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                      Available
                    </span>
                  </label>

                  <label className='flex items-center gap-1 cursor-pointer'>
                    <input
                      type="radio"
                      name={`availability-${item.id}`}
                      checked={!localData.available}
                      onChange={() => handleInputChange(item.id, 'available', false)}
                      disabled={!isEdit}
                    />
                    <span className={`ml-1 ${!localData.available ? 'text-gray-500 font-medium' : 'text-green-600'}`}>
                      Unavailable
                    </span>
                  </label>
                </div>

                <div className='mt-3 flex gap-2 justify-end'>
                  {isEdit ? (
                    <>
                      <button
                        onClick={() => handleSave(item.id)}
                        className='text-sm text-white bg-green-500 px-2 py-1 rounded'
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          toggleEdit(item.id)
                          setLocalDoctors(prev => ({ ...prev, [item.id]: item }))
                        }}
                        className='text-sm text-gray-600 border px-2 py-1 rounded'
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleEdit(item.id)}
                      className='text-sm text-blue-600 border px-2 py-1 rounded'
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DoctorsList
