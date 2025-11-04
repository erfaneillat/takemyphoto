import { useEffect, useState } from 'react'
import { Search, Users as UsersIcon, Crown, Star, Shield, CheckCircle, X, Edit2, Trash2, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import axios from 'axios'
import { resolveApiBase } from '../utils/api'

interface User {
  id: string
  phoneNumber?: string
  googleId?: string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  profilePicture?: string
  subscription: 'free' | 'pro' | 'premium'
  stars: number
  isVerified: boolean
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

interface UserStats {
  total: number
  byRole: Record<string, number>
  bySubscription: Record<string, number>
  verified: number
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [filterRole, setFilterRole] = useState<string>('')
  const [filterSubscription, setFilterSubscription] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const apiBase = resolveApiBase()
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filterRole && { role: filterRole }),
        ...(filterSubscription && { subscription: filterSubscription }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await axios.get(`${apiBase}/users/admin?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setUsers(response.data.data.users)
      setTotal(response.data.data.total)
      setTotalPages(response.data.data.totalPages)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const apiBase = resolveApiBase()
      
      const response = await axios.get(`${apiBase}/users/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [page, filterRole, filterSubscription, searchQuery])

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      const token = localStorage.getItem('accessToken')
      const apiBase = resolveApiBase()
      
      await axios.patch(
        `${apiBase}/users/admin/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      // Update local state
      setUsers(users.map(user => 
        user.id === id ? { ...user, ...data } : user
      ))
      
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, ...data })
      }

      // Refresh stats
      fetchStats()
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    try {
      const token = localStorage.getItem('accessToken')
      const apiBase = resolveApiBase()
      
      await axios.delete(`${apiBase}/users/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setUsers(users.filter(user => user.id !== id))
      if (selectedUser?.id === id) {
        setSelectedUser(null)
      }

      // Refresh stats
      fetchStats()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
  }

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'premium':
        return 'bg-yellow-100 text-yellow-800'
      case 'pro':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredUsers = users

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and subscriptions</p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <UsersIcon className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.byRole.admin || 0}</p>
              </div>
              <Shield className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Premium Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.bySubscription.premium || 0}</p>
              </div>
              <Crown className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.verified}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select
            value={filterSubscription}
            onChange={(e) => setFilterSubscription(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Subscriptions</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stars
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name || 'User'}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                            {(user.name || user.firstName || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-900">
                          {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {user.email && <div className="text-gray-900">{user.email}</div>}
                        {user.phoneNumber && <div className="text-gray-500">{user.phoneNumber}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSubscriptionColor(user.subscription)}`}>
                        {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-900">
                        <Star size={16} className="text-yellow-500" />
                        <span>{user.stars}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isVerified ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={16} />
                          Verified
                        </span>
                      ) : (
                        <span className="text-gray-500">Unverified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedUser(user)
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteUser(user.id)
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                {selectedUser.profilePicture ? (
                  <img
                    src={selectedUser.profilePicture}
                    alt={selectedUser.name || 'User'}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-semibold">
                    {(selectedUser.name || selectedUser.firstName || selectedUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">
                    {selectedUser.name || `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">ID: {selectedUser.id}</div>
                  <div className="text-sm text-gray-500">
                    Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => updateUser(selectedUser.id, { role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Subscription */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription</label>
                <select
                  value={selectedUser.subscription}
                  onChange={(e) => updateUser(selectedUser.id, { subscription: e.target.value as 'free' | 'pro' | 'premium' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              {/* Stars */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stars</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateUser(selectedUser.id, { stars: Math.max(0, selectedUser.stars - 1) })}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedUser.stars === 0}
                    title="Decrease stars"
                  >
                    <Minus size={20} className="text-gray-600" />
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 min-w-[100px] justify-center">
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-semibold text-gray-900">{selectedUser.stars}</span>
                  </div>
                  <button
                    onClick={() => updateUser(selectedUser.id, { stars: selectedUser.stars + 1 })}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Increase stars"
                  >
                    <Plus size={20} className="text-gray-600" />
                  </button>
                  <input
                    type="number"
                    value={selectedUser.stars}
                    onChange={(e) => updateUser(selectedUser.id, { stars: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Set exact value"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Use buttons to adjust by 1, or enter an exact value</p>
              </div>

              {/* Verified Status */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUser.isVerified}
                    onChange={(e) => updateUser(selectedUser.id, { isVerified: e.target.checked })}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Verified User</span>
                </label>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
                {selectedUser.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="text-gray-900">{selectedUser.email}</div>
                  </div>
                )}
                {selectedUser.phoneNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="text-gray-900">{selectedUser.phoneNumber}</div>
                  </div>
                )}
                {selectedUser.googleId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google ID</label>
                    <div className="text-gray-900 text-sm">{selectedUser.googleId}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  deleteUser(selectedUser.id)
                  setSelectedUser(null)
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
