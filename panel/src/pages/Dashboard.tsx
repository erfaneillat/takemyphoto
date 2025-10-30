import { useState, useEffect } from 'react'
import { Users, Activity, TrendingUp, FileText, User, Loader2 } from 'lucide-react'
import { dashboardService, DashboardStats } from '../services/dashboardService'

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await dashboardService.getStats()
        setStats(data)
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err)
        setError(err?.response?.data?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'Users':
        return Users
      case 'FileText':
        return FileText
      case 'User':
        return User
      default:
        return Activity
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (seconds < 60) return `${seconds} seconds ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p>No data available</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: `${stats.totalUsersChange >= 0 ? '+' : ''}${stats.totalUsersChange}%`,
      icon: Users,
      color: 'bg-blue-500',
      positive: stats.totalUsersChange >= 0,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      change: `${stats.activeUsersChange >= 0 ? '+' : ''}${stats.activeUsersChange}%`,
      icon: Activity,
      color: 'bg-green-500',
      positive: stats.activeUsersChange >= 0,
    },
    {
      title: 'Total Templates',
      value: stats.totalTemplates.toLocaleString(),
      change: `${stats.totalTemplatesChange >= 0 ? '+' : ''}${stats.totalTemplatesChange}%`,
      icon: FileText,
      color: 'bg-purple-500',
      positive: stats.totalTemplatesChange >= 0,
    },
    {
      title: 'Total Characters',
      value: stats.totalCharacters.toLocaleString(),
      change: `${stats.totalCharactersChange >= 0 ? '+' : ''}${stats.totalCharactersChange}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      positive: stats.totalCharactersChange >= 0,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2 text-base">Track your key metrics and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-3 group-hover:scale-105 transition-transform">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-3">
                    <span className={`text-sm font-semibold ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-400">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={26} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Popular Styles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Popular Styles
            </h2>
            <p className="text-sm text-gray-500 mt-1">Most used styles this month</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.popularStyles.length > 0 ? (
            stats.popularStyles.map((style) => (
              <div
                key={style.id}
                className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={style.imageUrl}
                    alt={style.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-semibold truncate">{style.name}</p>
                    <p className="text-white/80 text-xs">{style.usageCount} uses</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {style.usageCount}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-5 text-center text-gray-400 py-8">
              <p>No popular styles yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Recent Activity
            </h2>
            <p className="text-sm text-gray-500 mt-1">Latest updates from your platform</p>
          </div>
        </div>
        <div className="space-y-3">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => {
              const Icon = getIconComponent(activity.icon)
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={22} className="text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-black">
                      {activity.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              )
            })
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
