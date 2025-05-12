import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'

const DoctorProfile = () => {
  const { id } = useParams()
  const { dToken, profileData, setProfileData, getProfileData, updateProfileData, doctorId, getDoctorById } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)

  const updateProfile = async () => {
    try {
      const payload = {
        name: profileData.name,
        email: profileData.email, // Added
        password: profileData.password, // Added
        degree: profileData.degree,
        speciality: profileData.speciality,
        experience: profileData.experience,
        about: profileData.about,
        fees: profileData.fees,
        available: profileData.available,
        address: {
          line1: profileData.address?.line1 || '',
          line2: profileData.address?.line2 || ''
        },
        image: profileData.image
      }

      await updateProfileData(payload)
      toast.success("Profile updated successfully!")
      setIsEdit(false)
    } catch (error) {
      toast.error("Update failed. Please try again.")
      console.error("Update profile error:", error)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          image: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      let targetId = id || doctorId;

      if (!targetId && dToken?.includes('-')) {
        targetId = dToken.split('-')[1]; // Fallback to extract ID from token
      }

      if (dToken && targetId) {
        try {
          const data = await getDoctorById(targetId);
          setProfileData(data);
        } catch (err) {
          console.error("Failed to fetch doctor profile", err);
        }
      } else {
        console.warn("No valid doctor ID available for fetching profile.");
      }
    };

    fetchDoctorProfile();
  }, [dToken, doctorId, id]);

  return profileData && (
    <div>
      <div className='flex flex-col gap-4 m-5'>
        <div>
          <img
            className='bg-primary/80 w-full sm:max-w-64 rounded-lg'
            src={profileData.image}
            alt=""
          />
          {isEdit && (
            <input
              type="file"
              accept="image/*"
              className="mt-2"
              onChange={handleImageChange}
            />
          )}
        </div>

        <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
          <div>
            {
              isEdit ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className='text-3xl font-medium text-gray-700 w-full mb-2'
                />
              ) : (
                <p className='text-3xl font-medium text-gray-700'>{profileData.name}</p>
              )
            }
          </div>

          {/* Email and Password fields - shown only in edit mode */}
          <div className='mt-4'>
            <p className='text-gray-600 font-medium'>Email:</p>
            {
              isEdit ? (
                <input
                  type='email'
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className='border p-1 w-full mt-1'
                />
              ) : (
                <p className='text-sm text-gray-800 mt-1'>{profileData.email}</p>
              )
            }

<p className='text-gray-600 font-medium mt-3'>Password:</p>
{
  isEdit ? (
    <input
      type='text'
      value={profileData.password}
      onChange={(e) => setProfileData(prev => ({ ...prev, password: e.target.value }))}
      className='border p-1 w-full mt-1'
      placeholder='Enter new password'
    />
  ) : (
    <p className='text-sm text-gray-800 mt-1'>••••••••</p>
  )
}

          </div>



          <div className='flex flex-col gap-2 mt-2 text-gray-600'>
            {isEdit ? (
              <>
                <input
                  type='text'
                  value={profileData.degree}
                  onChange={(e) => setProfileData(prev => ({ ...prev, degree: e.target.value }))}
                  className='border p-1'
                  placeholder='Degree'
                />
                <input
                  type='text'
                  value={profileData.speciality}
                  onChange={(e) => setProfileData(prev => ({ ...prev, speciality: e.target.value }))}
                  className='border p-1'
                  placeholder='Speciality'
                />
              </>
            ) : (
              <p>{profileData.degree} - {profileData.speciality}</p>
            )}
            {isEdit ? (
              <input
                type="text"
                value={profileData.experience}
                onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                className='w-28 border p-1 text-sm'
                placeholder='Experience'
              />
            ) : (
              <button className='py-0.5 px-2 border text-xs rounded-full'>{profileData.experience}</button>
            )}
          </div>

          <div className='mt-3'>
            <p className='text-sm font-medium text-[#262626]'>About:</p>
            {
              isEdit ? (
                <textarea
                  className='w-full outline-primary p-2 mt-1'
                  rows={5}
                  value={profileData.about}
                  onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                />
              ) : (
                <p className='text-sm text-gray-600 mt-1'>{profileData.about}</p>
              )
            }
          </div>

          <p className='text-gray-600 font-medium mt-4'>
            Appointment fee: <span className='text-gray-800'>
              {currency} {
                isEdit
                  ? <input
                    type='number'
                    value={profileData.fees}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                    className='w-20 border p-1'
                  />
                  : profileData.fees
              }
            </span>
          </p>

          <div className='flex gap-2 py-2'>
            <p>Address:</p>
            <p className='text-sm'>
              {isEdit ? (
                <>
                  <input
                    type='text'
                    value={profileData.address.line1}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value }
                    }))}
                    className='border p-1 w-full mb-1'
                  />
                  <input
                    type='text'
                    value={profileData.address.line2}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value }
                    }))}
                    className='border p-1 w-full'
                  />
                </>
              ) : (
                <>
                  {profileData.address.line1}<br />
                  {profileData.address.line2}
                </>
              )}
            </p>
          </div>

          <div className='flex gap-1 pt-2'>
            <input
              type="checkbox"
              onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
              checked={profileData.available}
            />
            <label>Available</label>
          </div>

          {
            isEdit ? (
              <button
                onClick={updateProfile}
                className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'
              >
                Edit
              </button>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
