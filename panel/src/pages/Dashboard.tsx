import { Users, Activity, TrendingUp, DollarSign } from 'lucide-react'

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12.5%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Sessions',
      value: '1,234',
      change: '+8.2%',
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      title: 'Growth Rate',
      value: '23.5%',
      change: '+4.3%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+15.3%',
      icon: DollarSign,
      color: 'bg-orange-500',
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
        {stats.map((stat) => {
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
                    <span className="text-sm font-semibold text-green-600">{stat.change}</span>
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

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Recent Activity
            </h2>
            <p className="text-sm text-gray-500 mt-1">Latest updates from your platform</p>
          </div>
          <button className="text-sm font-semibold text-gray-600 hover:text-black transition-colors px-4 py-2 rounded-lg hover:bg-gray-100">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group cursor-pointer border border-transparent hover:border-gray-200"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={22} className="text-gray-700" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-black">
                  New user registered
                </p>
                <p className="text-sm text-gray-500 mt-0.5">2 minutes ago</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
