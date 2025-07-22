'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { userAPI } from '@/app/_lib/apiServices'
import { useAPI } from '@/app/_lib/useAPI'
import Navbar from '@/app/_components/Navbar'
import UserProfile from '@/app/_components/UserProfile'
import UsersList from '@/app/_components/UserList'

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { loading, error, callAPI } = useAPI()
  
  const [user, setUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [activeTab, setActiveTab] = useState('profile')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Check authentication and set user
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      // Check for stored user data (for direct API login)
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      } else {
        router.push('/login')
      }
    } else if (session?.user) {
      // NextAuth session exists
      setUser(session.user)
    }
  }, [session, status, router])

  // Fetch all users for admin
  useEffect(() => {
    const fetchUsers = async () => {
      if (user && (user.role?.toUpperCase() === 'ADMIN')) {
        const result = await callAPI(userAPI.getUsers)
        if (result) {
          setAllUsers(result.users || [])
        }
      }
    }

    fetchUsers()
  }, [user, callAPI])

  // Show logout confirmation popup
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  // Cancel logout
  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false)
  }

  // Confirm and perform logout
  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true)
    
    try {
      // Clear localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      
      // Sign out from NextAuth if session exists
      if (session) {
        await signOut({ redirect: false })
      }
      
      // Redirect to home
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if logout fails
      router.push('/')
    } finally {
      setIsLoggingOut(false)
      setShowLogoutConfirm(false)
    }
  }

  const handleUserRoleUpdate = async (userId, newRole) => {
    const result = await callAPI(userAPI.updateUserRole, userId, newRole)
    if (result) {
      // Refresh users list
      const updatedUsers = await callAPI(userAPI.getUsers)
      if (updatedUsers) {
        setAllUsers(updatedUsers.users || [])
      }
      alert('User role updated successfully!')
    }
  }

  // Loading state
  if (status === 'loading' || (!user && status === 'authenticated')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Load dashboard....</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user && status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar 
        user={user} 
        onLogout={handleLogoutClick} // Changed to show confirmation
        onProfileClick={() => setShowProfileModal(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.username || user.name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Role: <span className="font-medium text-blue-600">{user.role || 'USER'}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Authentication: {session ? 'NextAuth Session' : 'Direct API Login'}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Profile
              </button>
              
              {user.role?.toUpperCase() === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Manage Users
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <UserProfile user={user} />
            )}
            
            {activeTab === 'users' && user.role?.toUpperCase() === 'ADMIN' && (
              <UsersList 
                users={allUsers}
                onRoleUpdate={handleUserRoleUpdate}
                loading={loading}
                error={error}
              />
            )}
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <UserProfile user={user} isModal={true} />
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleLogoutCancel}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 transform transition-all">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Confirm Sign Out</h3>
                  <p className="text-sm text-gray-500">Are you sure you want to sign out?</p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700">
                  You will be redirected to the home page and will need to sign in again to access your dashboard.
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={handleLogoutCancel}
                  disabled={isLoggingOut}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Signing Out...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
