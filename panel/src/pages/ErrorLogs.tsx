import { useEffect, useState } from 'react'
import { AlertCircle, Search, Trash2, Eye, CheckCircle, AlertTriangle, XCircle, Info, Code, Database, Shield, Zap, Server } from 'lucide-react'
import axios from 'axios'
import { resolveApiBase } from '../utils/api'

interface ErrorLog {
  id: string
  type: 'api' | 'database' | 'validation' | 'authentication' | 'authorization' | 'generation' | 'external_service' | 'system' | 'unknown'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  stack?: string
  endpoint?: string
  method?: string
  userId?: string
  statusCode?: number
  requestBody?: any
  requestParams?: any
  requestQuery?: any
  userAgent?: string
  ipAddress?: string
  metadata?: Record<string, any>
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface ErrorLogStats {
  total: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  unresolved: number
}

const ErrorLogs = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ErrorLogStats | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterResolved, setFilterResolved] = useState<string>('all')

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const apiBase = resolveApiBase()
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (filterType !== 'all') params.append('type', filterType)
      if (filterSeverity !== 'all') params.append('severity', filterSeverity)
      if (filterResolved !== 'all') params.append('resolved', filterResolved === 'resolved' ? 'true' : 'false')

      const response = await axios.get(`${apiBase}/error-logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setLogs(response.data.data.logs)
      setTotal(response.data.data.total)
    } catch (error) {
      console.error('Failed to fetch error logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const apiBase = resolveApiBase()
      
      const response = await axios.get(`${apiBase}/error-logs/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch error log stats:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, filterType, filterSeverity, filterResolved])

  useEffect(() => {
    fetchStats()
  }, [])

  const updateLogResolved = async (id: string, resolved: boolean, notes?: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const apiBase = resolveApiBase()
      
      await axios.patch(
        `${apiBase}/error-logs/${id}`,
        { resolved, notes },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      setLogs(logs.map(log => 
        log.id === id ? { ...log, resolved } : log
      ))
      
      if (selectedLog?.id === id) {
        setSelectedLog({ ...selectedLog, resolved })
      }
      
      fetchStats()
    } catch (error) {
      console.error('Failed to update error log:', error)
    }
  }

  const deleteLog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this error log?')) return
    
    try {
      const token = localStorage.getItem('accessToken')
      const apiBase = resolveApiBase()
      
      await axios.delete(`${apiBase}/error-logs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setLogs(logs.filter(log => log.id !== id))
      if (selectedLog?.id === id) {
        setSelectedLog(null)
      }
      fetchStats()
    } catch (error) {
      console.error('Failed to delete error log:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Info size={16} />
      case 'medium':
        return <AlertCircle size={16} />
      case 'high':
        return <AlertTriangle size={16} />
      case 'critical':
        return <XCircle size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <Code size={16} />
      case 'database':
        return <Database size={16} />
      case 'validation':
        return <CheckCircle size={16} />
      case 'authentication':
      case 'authorization':
        return <Shield size={16} />
      case 'generation':
        return <Zap size={16} />
      case 'external_service':
        return <Server size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-gray-600 mt-1">Monitor and manage application errors</p>
        </div>
        <div className="flex items-center gap-4">
          {stats && (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg">
                <AlertCircle size={20} />
                <span className="font-semibold">{stats.unresolved} Unresolved</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg">
                <Eye size={20} />
                <span className="font-semibold">{stats.total} Total</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Info size={20} />
              <span className="font-medium">Low</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.bySeverity.low || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-yellow-600 mb-2">
              <AlertCircle size={20} />
              <span className="font-medium">Medium</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.bySeverity.medium || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <AlertTriangle size={20} />
              <span className="font-medium">High</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.bySeverity.high || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <XCircle size={20} />
              <span className="font-medium">Critical</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.bySeverity.critical || 0}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search error logs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="api">API</option>
            <option value="database">Database</option>
            <option value="validation">Validation</option>
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="generation">Generation</option>
            <option value="external_service">External Service</option>
            <option value="system">System</option>
          </select>
          <select 
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select 
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Error Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Loading error logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No error logs found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
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
              {logs.map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(log.type)}
                      <span className="text-sm font-medium text-gray-900 capitalize">{log.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 truncate max-w-md">{log.message}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                      {getSeverityIcon(log.severity)}
                      {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {log.method && <span className="font-medium">{log.method} </span>}
                      {log.endpoint || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.resolved ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <CheckCircle size={14} />
                        Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        <XCircle size={14} />
                        Unresolved
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteLog(log.id)
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

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">
            Showing page {page} of {Math.ceil(total / 20)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(Math.ceil(total / 20), page + 1))}
              disabled={page >= Math.ceil(total / 20)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Error Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getSeverityColor(selectedLog.severity)}`}>
                      {getSeverityIcon(selectedLog.severity)}
                      {selectedLog.severity.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                      {getTypeIcon(selectedLog.type)}
                      {selectedLog.type.charAt(0).toUpperCase() + selectedLog.type.slice(1)}
                    </span>
                    {selectedLog.resolved ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                        <CheckCircle size={14} />
                        Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                        <XCircle size={14} />
                        Unresolved
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedLog.message}</h2>
                  <div className="mt-2 text-sm text-gray-500">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Request Info */}
              {(selectedLog.endpoint || selectedLog.method) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Request</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{selectedLog.method}</span> {selectedLog.endpoint}
                      {selectedLog.statusCode && <span className="ml-2 text-gray-600">({selectedLog.statusCode})</span>}
                    </p>
                    {selectedLog.ipAddress && (
                      <p className="text-sm text-gray-600 mt-1">IP: {selectedLog.ipAddress}</p>
                    )}
                    {selectedLog.userId && (
                      <p className="text-sm text-gray-600">User ID: {selectedLog.userId}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Stack Trace */}
              {selectedLog.stack && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stack Trace</label>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs whitespace-pre-wrap">{selectedLog.stack}</pre>
                  </div>
                </div>
              )}

              {/* Request Data */}
              {(selectedLog.requestBody || selectedLog.requestParams || selectedLog.requestQuery) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Request Data</label>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedLog.requestBody && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Body:</p>
                        <pre className="text-xs text-gray-900">{JSON.stringify(selectedLog.requestBody, null, 2)}</pre>
                      </div>
                    )}
                    {selectedLog.requestParams && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Params:</p>
                        <pre className="text-xs text-gray-900">{JSON.stringify(selectedLog.requestParams, null, 2)}</pre>
                      </div>
                    )}
                    {selectedLog.requestQuery && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Query:</p>
                        <pre className="text-xs text-gray-900">{JSON.stringify(selectedLog.requestQuery, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedLog.metadata && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metadata</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs text-gray-900">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedLog.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-900">
                    {selectedLog.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {!selectedLog.resolved && (
                  <button
                    onClick={() => updateLogResolved(selectedLog.id, true)}
                    className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle size={16} />
                    Mark as Resolved
                  </button>
                )}
                {selectedLog.resolved && (
                  <button
                    onClick={() => updateLogResolved(selectedLog.id, false)}
                    className="flex items-center gap-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <XCircle size={16} />
                    Mark as Unresolved
                  </button>
                )}
                <button
                  onClick={() => deleteLog(selectedLog.id)}
                  className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ErrorLogs
