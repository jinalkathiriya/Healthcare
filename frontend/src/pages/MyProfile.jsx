import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyProfile = () => {
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(null)
    const [updatedData, setUpdatedData] = useState({})

    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

    useEffect(() => {
        setUpdatedData({})
        setImage(null)
    }, [isEdit])

    const handleChange = (field, value) => {
        setUpdatedData(prev => ({ ...prev, [field]: value }))
        setUserData(prev => ({ ...prev, [field]: value }))
    }

    const handleAddressChange = (line, value) => {
        const updatedAddress = { ...(userData.address || {}), [line]: value }
        setUpdatedData(prev => ({ ...prev, address: updatedAddress }))
        setUserData(prev => ({ ...prev, address: updatedAddress }))
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64Image = reader.result

            // Update local state
            setImage(base64Image)
            handleChange('image', base64Image)

            try {
                const updatedUser = { ...userData, image: base64Image }
                await axios.put(`http://localhost:5000/users/${userData.id}`, updatedUser)
                toast.success("Image uploaded successfully!")
                await loadUserProfileData()
            } catch (error) {
                console.error(error)
                toast.error("Image upload failed.")
            }
        }

        reader.readAsDataURL(file)
    }

    const updateUserProfileData = async () => {
        try {
            const updatedUser = { ...userData, ...updatedData }

            if (
                updatedData.name || updatedData.phone ||
                updatedData.address || updatedData.gender ||
                updatedData.dob || updatedData.image
            ) {
                await axios.put(`http://localhost:5000/users/${userData.id}`, updatedUser)

                toast.success('Profile updated successfully!')
                await loadUserProfileData()
                setIsEdit(false)
                setImage(null)
            } else {
                toast.info("No changes to save.")
            }
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    return userData ? (
        <div className='max-w-lg flex flex-col gap-2 text-sm pt-5'>

            {/* Edit Mode Image Upload */}
            {isEdit ? (
                <label htmlFor='image'>
                    <div className='w-36 h-36 rounded-lg bg-[#2D2D2D] flex items-center justify-center cursor-pointer relative overflow-hidden shadow-md'>
                        <img
                            src={image || userData.image || assets.upload_area}
                            alt='Profile'
                            className='w-full h-full object-cover'
                            onError={(e) => {
                                e.target.onerror = null
                                e.target.src = assets.upload_area
                            }}
                        />
                    </div>
                    <input onChange={handleImageUpload} type="file" id="image" hidden />
                </label>
            ) : (
                <div className='w-36 h-36 rounded-lg bg-[#2D2D2D] overflow-hidden shadow-md'>
                    <img
                        className='w-full h-full object-cover'
                        src={userData.image || assets.upload_area}
                        alt="Profile"
                        onError={(e) => {
                            e.target.onerror = null
                            e.target.src = assets.upload_area
                        }}
                    />
                </div>
            )}


            {isEdit ? (
                <input
                    className='bg-gray-50 text-3xl font-medium max-w-60'
                    type="text"
                    onChange={(e) => handleChange('name', e.target.value)}
                    value={userData.name}
                />
            ) : (
                <p className='font-medium text-3xl text-[#262626] mt-4'>{userData.name}</p>
            )}

            <hr className='bg-[#ADADAD] h-[1px] border-none' />

            <div>
                <p className='text-gray-600 underline mt-3'>CONTACT INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]'>
                    <p className='font-medium'>Email id:</p>
                    <p className='text-blue-500'>{userData.email}</p>

                    <p className='font-medium'>Phone:</p>
                    {isEdit ? (
                        <input
                            className='bg-gray-50 max-w-52'
                            type="text"
                            onChange={(e) => handleChange('phone', e.target.value)}
                            value={userData.phone}
                        />
                    ) : (
                        <p className='text-blue-500'>{userData.phone}</p>
                    )}

                    <p className='font-medium'>Address:</p>
                    {isEdit ? (
                        <div>
                            <input
                                className='bg-gray-50'
                                type="text"
                                onChange={(e) => handleAddressChange('line1', e.target.value)}
                                value={userData.address?.line1 || ''}
                            />
                            <br />
                            <input
                                className='bg-gray-50'
                                type="text"
                                onChange={(e) => handleAddressChange('line2', e.target.value)}
                                value={userData.address?.line2 || ''}
                            />
                        </div>
                    ) : (
                        <p className='text-gray-500'>
                            {userData.address?.line1 || '-'}<br />{userData.address?.line2 || '-'}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <p className='text-[#797979] underline mt-3'>BASIC INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600'>
                    <p className='font-medium'>Gender:</p>
                    {isEdit ? (
                        <select
                            className='max-w-20 bg-gray-50'
                            onChange={(e) => handleChange('gender', e.target.value)}
                            value={userData.gender}
                        >
                            <option value="Not Selected">Not Selected</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    ) : (
                        <p className='text-gray-500'>{userData.gender}</p>
                    )}

                    <p className='font-medium'>Birthday:</p>
                    {isEdit ? (
                        <input
                            className='max-w-28 bg-gray-50'
                            type='date'
                            onChange={(e) => handleChange('dob', e.target.value)}
                            value={userData.dob}
                        />
                    ) : (
                        <p className='text-gray-500'>{userData.dob}</p>
                    )}
                </div>
            </div>

            <div className='mt-10'>
                {isEdit ? (
                    <button
                        onClick={updateUserProfileData}
                        className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
                    >
                        Save information
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEdit(true)}
                        className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
                    >
                        Edit
                    </button>
                )}
            </div>
        </div>
    ) : null
}

export default MyProfile
