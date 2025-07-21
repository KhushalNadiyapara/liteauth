'use client'

export default function UserProfile({ user, isModal = false }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleBadgeColor = (role) => {
    return (role === 'ADMIN' || role === 'admin') 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
          {(user?.username || user?.name || 'U')[0].toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.username || user?.name}
          </h2>
          <p className="text-gray-600">{user?.email}</p>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user?.role)}`}>
            {user?.role || 'USER'}
          </span>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">User ID</h3>
          <p className="text-gray-900">{user?.id || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Username</h3>
          <p className="text-gray-900">{user?.username || user?.name || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Email Address</h3>
          <p className="text-gray-900">{user?.email || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Role</h3>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user?.role)}`}>
            {user?.role || 'USER'}
          </span>
        </div>

        {user?.createdAt && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Member Since</h3>
            <p className="text-gray-900">{formatDate(user.createdAt)}</p>
          </div>
        )}

        {user?.updatedAt && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Last Updated</h3>
            <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
          </div>
        )}
      </div>

    </div>
  )
}
