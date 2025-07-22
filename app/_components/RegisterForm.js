'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { authAPI } from '@/app/_lib/apiServices'
import { useAPI } from '@/app/_lib/useAPI'
import { useRouter } from 'next/navigation'
import * as Yup from 'yup'

// Simple debounce function
function debounce(func, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// Yup validation schema
const validationSchema = Yup.object({
  username:Yup.string()
  .min(3,"username is must be 3 character")
  .max(25,"username not exceed 25 characters")
  .required("username is required")
  ,
  email:Yup.string()
  .email("Invaid email format")
  .required("email is required") ,

   password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .matches(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .matches(/^(?=.*\d)/, 'Password must contain at least one number')
    .matches(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character')
    .required('Password is required'),

    role : Yup.string()
    .oneOf(['user', 'admin'], 'Role must be either user or admin').required("role is required")


})

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
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')
  const [validationStatus, setValidationStatus] = useState({
    username: { checking: false, available: null },
    email: { checking: false, available: null }
  })

  // API calls for availability checking
  const checkUsername = async (username) => {
    console.log('🔍 Checking username via API:', username)
    
    try {
      const result = await callAPI(authAPI.checkUsername, username)
      return result?.available || false
    } catch (error) {
      console.error('Username check error:', error)
      return false
    }
  }

  const checkEmail = async (email) => {
    console.log('Checking email via API:', email)
    
    try {
      const result = await callAPI(authAPI.checkEmail, email)
      return result?.available || false
    } catch (error) {
      console.error('Email check error:', error)
      return false
    }
  }


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

  const debouncedPasswordCheck = debounce((password) => {
    setPasswordStrength(getPasswordStrength(password))
  }, 300)

  // Debounced username availability check
  const debouncedUsernameCheck = debounce(async (username) => {
    if (username.length >= 3) {
      console.log('Starting debounced username check:', username)
      setValidationStatus(prev => ({ 
        ...prev, 
        username: { checking: true, available: null } 
      }))
      
      try {
        const isAvailable = await checkUsername(username)
        console.log('Username check result:', isAvailable)
        
        setValidationStatus(prev => ({ 
          ...prev, 
          username: { checking: false, available: isAvailable } 
        }))
      
        if (!isAvailable) {
          setErrors(prev => ({ 
            ...prev, 
            username: 'Username is already taken' 
          }))
        } else {
          setErrors(prev => {
            const newErrors = { ...prev }
            if (newErrors.username === 'Username is already taken') {
              delete newErrors.username
            }
            return newErrors
          })
        }
      } catch (error) {
        console.error('Username check failed:', error)
        setValidationStatus(prev => ({ 
          ...prev, 
          username: { checking: false, available: null } 
        }))
      }
    }
  }, 600)

  // Debounced email availability check
  const debouncedEmailCheck = debounce(async (email) => {
    if (email && /\S+@\S+\.\S+/.test(email)) {
      console.log('🚀 Starting debounced email check:', email)
      setValidationStatus(prev => ({ 
        ...prev, 
        email: { checking: true, available: null } 
      }))
      
      try {
        const isAvailable = await checkEmail(email)
        console.log('Email check result:', isAvailable)
        
        setValidationStatus(prev => ({ 
          ...prev, 
          email: { checking: false, available: isAvailable } 
        }))
        
        // Update availability error
        if (!isAvailable) {
          setErrors(prev => ({ 
            ...prev, 
            email: 'Email is already registered' 
          }))
        } else {
          setErrors(prev => {
            const newErrors = { ...prev }
            if (newErrors.email === 'Email is already registered') {
              delete newErrors.email
            }
            return newErrors
          })
        }
      } catch (error) {
        console.error('Email check failed:', error)
        setValidationStatus(prev => ({ 
          ...prev, 
          email: { checking: false, available: null } 
        }))
      }
    }
  }, 600)

  const debouncedYupValidation = debounce(async (name, value) => {
    try {
      await validationSchema.validateAt(name, { [name]: value })
      
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
      
      if (name === 'username' && value.length >= 3) {
        debouncedUsernameCheck(value)
      } else if (name === 'email' && value) {
        debouncedEmailCheck(value)
      }
      
    } catch (error) {
      // Set Yup validation error
      setErrors(prev => ({ 
        ...prev, 
        [name]: error.message 
      }))
    }
  }, 400)


  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({ ...prev, [name]: value }))
   
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Clear API error
    if (apiError) clearError()
    
    if (name === 'username' || name === 'email') {
      setValidationStatus(prev => ({
        ...prev,
        [name]: { checking: false, available: null }
      }))
    }
    
    if (name === 'password') {
      debouncedPasswordCheck(value)
    }
    
    if (touched[name] || value.length > 0) {
      debouncedYupValidation(name, value)
    }
  }

  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target
    
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Immediate validation on blur
    validationSchema.validateAt(name, { [name]: value })
      .then(() => {
        // Clear error if validation passes
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
        
        // Trigger availability checks
        if (name === 'username' && value.length >= 3) {
          debouncedUsernameCheck(value)
        } else if (name === 'email' && value) {
          debouncedEmailCheck(value)
        }
      })
      .catch(error => {
        setErrors(prev => ({ 
          ...prev, 
          [name]: error.message 
        }))
      })
  }

  // Form validation
  const validateForm = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false })
      setErrors({})
      return true
    } catch (error) {
      const newErrors = {}
      error.inner.forEach(err => {
        newErrors[err.path] = err.message
      })
      setErrors(newErrors)
      return false
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      role: true
    })
    
    // Validate form
    const isValid = await validateForm()
    if (!isValid) return
    
    // Check if validation is in progress
    if (validationStatus.username.checking || validationStatus.email.checking) {
      alert('Please wait for validation to complete')
      return
    }
    
    // Check availability
    if (validationStatus.username.available === false || 
        validationStatus.email.available === false) {
      alert('Please fix the availability issues before submitting')
      return
    }
    
    // Submit form
    console.log('🚀 Submitting form with data:', formData)
    const result = await callAPI(authAPI.register, formData)
    
    if (result) {
      alert('Registration successful!')
      router.push('/login')
    }
  }

  // Get field validation status
  const getFieldValidationClass = (fieldName) => {
    if (errors[fieldName]) return 'border-red-500'
    if (fieldName === 'username' && validationStatus.username.available === true) return 'border-green-500'
    if (fieldName === 'username' && validationStatus.username.available === false) return 'border-red-500'
    if (fieldName === 'email' && validationStatus.email.available === true) return 'border-green-500'
    if (fieldName === 'email' && validationStatus.email.available === false) return 'border-red-500'
    return 'border-gray-300'
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
              <div className="bg-blue-600 p-4 rounded-full inline-block mb-4 hover:bg-blue-700 transition-colors">
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
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldValidationClass('username')}`}
                    placeholder="Enter username"
                    autoComplete="username"
                  />
                  
                  {/* Validation Icon */}
                  <div className="absolute right-3 top-3">
                    {validationStatus.username.checking && (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    )}
                    {validationStatus.username.available === true && !errors.username && (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {(validationStatus.username.available === false || errors.username) && (
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Error Messages */}
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
                
                {/* Success Message */}
                {validationStatus.username.available === true && !errors.username && (
                  <p className="text-green-500 text-sm mt-1">✓ Username available</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldValidationClass('email')}`}
                    placeholder="Enter email address"
                    autoComplete="email"
                  />
                  
                  {/* Validation Icon */}
                  <div className="absolute right-3 top-3">
                    {validationStatus.email.checking && (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    )}
                    {validationStatus.email.available === true && !errors.email && (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {(validationStatus.email.available === false || errors.email) && (
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Error Messages */}
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
                
                {/* Success Message */}
                {validationStatus.email.available === true && !errors.email && (
                  <p className="text-green-500 text-sm mt-1">✓ Email available</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Error Messages */}
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
                
                {/* Password Strength */}
                {passwordStrength && formData.password && !errors.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.bgColor}`}
                          style={{ width: passwordStrength.width }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${passwordStrength.color}`}>
                        {passwordStrength.level}
                      </span>
                    </div>
                    
                    {/* Password Requirements */}
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Password must contain:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                          At least 6 characters
                        </li>
                        <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                          One lowercase letter
                        </li>
                        <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                          One uppercase letter
                        </li>
                        <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                          One number
                        </li>
                        <li className={/[@$!%*?&]/.test(formData.password) ? 'text-green-600' : ''}>
                          One special character (@$!%*?&)
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                )}
              </div>

              {/* API Error */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-red-600 text-sm">{apiError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  apiLoading || 
                  validationStatus.username.checking || 
                  validationStatus.email.checking ||
                  Object.keys(errors).length > 0
                }
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {apiLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Creating Account...
                  </div>
                ) : validationStatus.username.checking || validationStatus.email.checking ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Validating...
                  </div>
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
            <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
