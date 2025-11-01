import { useEffect, useState } from 'react'
import { Mail, Search, Trash2, Eye, CheckCircle, Clock, MessageCircle, Archive } from 'lucide-react'
import axios from 'axios'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  createdAt: string
  updatedAt: string
}

const Contacts = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:2000/api/v1'
      
      const response = await axios.get(`${apiBase}/contact/admin?page=${page}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setMessages(response.data.data.messages)
      setTotal(response.data.data.total)
    } catch (error) {
      console.error('Failed to fetch contact messages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [page])

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:2000/api/v1'
      
      await axios.patch(
        `${apiBase}/contact/admin/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, status: status as ContactMessage['status'] } : msg
      ))
      
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: status as ContactMessage['status'] })
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    
    try {
      const token = localStorage.getItem('accessToken')
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:2000/api/v1'
      
      await axios.delete(`${apiBase}/contact/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setMessages(messages.filter(msg => msg.id !== id))
      if (selectedMessage?.id === id) {
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-blue-100 text-blue-800'
      case 'read':
        return 'bg-green-100 text-green-800'
      case 'replied':
        return 'bg-purple-100 text-purple-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <Clock size={16} />
      case 'read':
        return <Eye size={16} />
      case 'replied':
        return <MessageCircle size={16} />
      case 'archived':
        return <Archive size={16} />
      default:
        return <Clock size={16} />
    }
  }

  const filteredMessages = filterStatus === 'all' 
    ? messages 
    : messages.filter(msg => msg.status === filterStatus)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">View and manage contact form submissions</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg">
          <Mail size={20} />
          <span className="font-semibold">{total} Total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Mail size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No messages found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <tr 
                  key={message.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedMessage(message)}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{message.name}</div>
                      <div className="text-sm text-gray-500">{message.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 truncate max-w-xs">{message.subject}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                      {getStatusIcon(message.status)}
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMessage(message.id)
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">From:</span> {selectedMessage.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedMessage.email}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'read')}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                      selectedMessage.status === 'read'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle size={16} />
                    Mark as Read
                  </button>
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'replied')}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                      selectedMessage.status === 'replied'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <MessageCircle size={16} />
                    Mark as Replied
                  </button>
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'archived')}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                      selectedMessage.status === 'archived'
                        ? 'bg-gray-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Archive size={16} />
                    Archive
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="flex items-center gap-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Mail size={16} />
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Contacts
