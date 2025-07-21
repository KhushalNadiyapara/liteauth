'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { authAPI } from '@/app/_lib/apiServices'
import { useAPI } from '@/app/_lib/useAPI'
import { useRouter } from 'next/navigation'

// Simple debounce function
function debounce(func, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

export default function Register() {
  const router = useRouter()
  const { loading: apiLoading, error: apiError, callAPI, clearError } = useAPI()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: ''
  })
  
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')
  const [validationStatus, setValidationStatus] = useState({
    username: { checking: false, available: null },
    email: { checking: false, available: null }
  })

  // Mock API calls
 const checkUsername = async (username) => {
  console.log('Checking username via API:', username); // You'll see this in console
  
  try {
    const result = await callAPI(authAPI.checkUsername, username);
    return result?.available || false;
  } catch (error) {
    console.error('Username check error:', error);
    return false;
  }
}

const checkEmail = async (email) => {
  console.log('Checking email via API:', email); // You'll see this in console
  
  try {
    const result = await callAPI(authAPI.checkEmail, email);
    return result?.available || false;
  } catch (error) {
    console.error('Email check error:', error);
    return false;
  }
}

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return ''
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z\d]/.test(password)) score++
    
    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500']
    const bgColors = ['bg-red-200', 'bg-orange-200', 'bg-yellow-200', 'bg-blue-200', 'bg-green-200']
    const widths = ['20%', '40%', '60%', '80%', '100%']
    
    return {
      level: levels[score] || levels[0],
      color: colors[score] || colors[0],
      bgColor: bgColors[score] || bgColors[0],
      width: widths[score] || widths[0]
    }
  }

  const debouncedUsernameCheck = debounce(async (username) => {
  if (username.length >= 3) {
    console.log('Starting debounced username check:', username);
    setValidationStatus(prev => ({ ...prev, username: { checking: true, available: null } }))
    
    try {
      const isAvailable = await checkUsername(username);
      console.log('Username check result:', isAvailable);
      
      setValidationStatus(prev => ({ ...prev, username: { checking: false, available: isAvailable } }))
      
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, username: 'Username is already taken' }))
      } else {
        setErrors(prev => ({ ...prev, username: '' }))
      }
    } catch (error) {
      console.error('Username check failed:', error);
      setValidationStatus(prev => ({ ...prev, username: { checking: false, available: null } }))
    }
  }
}, 600) // 600ms debounce

const debouncedEmailCheck = debounce(async (email) => {
  if (email && /\S+@\S+\.\S+/.test(email)) {
    console.log('Starting debounced email check:', email);
    setValidationStatus(prev => ({ ...prev, email: { checking: true, available: null } }))
    
    try {
      const isAvailable = await checkEmail(email);
      console.log('Email check result:', isAvailable);
      
      setValidationStatus(prev => ({ ...prev, email: { checking: false, available: isAvailable } }))
      
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, email: 'Email is already registered' }))
      } else {
        setErrors(prev => ({ ...prev, email: '' }))
      }
    } catch (error) {
      console.error('Email check failed:', error);
      setValidationStatus(prev => ({ ...prev, email: { checking: false, available: null } }))
    }
  }
}, 600) // 600ms debounce

  const debouncedPasswordCheck = debounce((password) => {
    setPasswordStrength(getPasswordStrength(password))
  }, 300) // 300ms debounce

  const debouncedValidation = debounce((name, value) => {
    const newErrors = { ...errors }
    
    if (name === 'username') {
      if (value.length > 0 && value.length < 3) {
        newErrors.username = 'Username must be at least 3 characters'
      } else if (value.length >= 3) {
        newErrors.username = ''
        debouncedUsernameCheck(value) // Call debounced availability check
      }
    }
    
    if (name === 'email') {
      if (value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = 'Please enter a valid email'
      } else if (value && /\S+@\S+\.\S+/.test(value)) {
        newErrors.email = ''
        debouncedEmailCheck(value) // Call debounced availability check
      }
    }
    
    if (name === 'password') {
      if (value.length > 0 && value.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      } else {
        newErrors.password = ''
      }
      debouncedPasswordCheck(value) // Call debounced strength check
    }
    
    setErrors(newErrors)
  }, 400) // 400ms debounce

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear errors immediately for better UX
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    if (apiError) clearError()
    
    // Reset validation status
    if (name === 'username' || name === 'email') {
      setValidationStatus(prev => ({
        ...prev,
        [name]: { checking: false, available: null }
      }))
    }
    
    // 🚀 DEBOUNCED VALIDATION
    debouncedValidation(name, value)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.username) newErrors.username = 'Username is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (!formData.role) newErrors.role = 'Role is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (validationStatus.username.checking || validationStatus.email.checking) {
      alert('Please wait for validation to complete')
      return
    }

    const result = await callAPI(authAPI.register, formData)
    
    if (result) {
      alert('Registration successful!')
      router.push('/login')
    }
  }

  return (
    <>
      <Head>
        <title>Register - LiteAuth</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/">
              <div className="bg-blue-600 p-4 rounded-full inline-block mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600">Join LiteAuth to get started</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.username ? 'border-red-500' : 
                      validationStatus.username.available === true ? 'border-green-500' :
                      validationStatus.username.available === false ? 'border-red-500' :
                      'border-gray-300'
                    }`}
                    placeholder="Enter username"
                  />
                  
                  {/* Validation Icon */}
                  <div className="absolute right-3 top-3">
                    {validationStatus.username.checking && (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    )}
                    {validationStatus.username.available === true && (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {validationStatus.username.available === false && (
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                {validationStatus.username.available === true && (
                  <p className="text-green-500 text-sm mt-1">✓ Username available</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 
                      validationStatus.email.available === true ? 'border-green-500' :
                      validationStatus.email.available === false ? 'border-red-500' :
                      'border-gray-300'
                    }`}
                    placeholder="Enter email"
                  />
                  
                  {/* Validation Icon */}
                  <div className="absolute right-3 top-3">
                    {validationStatus.email.checking && (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    )}
                    {validationStatus.email.available === true && (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {validationStatus.email.available === false && (
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                {validationStatus.email.available === true && (
                  <p className="text-green-500 text-sm mt-1">✓ Email available</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                
                {/* Password Strength */}
                {passwordStrength && formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${passwordStrength.bgColor}`}
                          style={{ width: passwordStrength.width }}
                        ></div>
                      </div>
                      <span className={`text-sm ${passwordStrength.color}`}>
                        {passwordStrength.level}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>

              {/* API Error */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{apiError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={apiLoading || validationStatus.username.checking || validationStatus.email.checking}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                {apiLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Creating Account...
                  </div>
                ) : validationStatus.username.checking || validationStatus.email.checking ? (
                  'Validating...'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
