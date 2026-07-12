import { useApi } from '../hooks/useApi'

function MetricCard({ icon, label, value, sub, color = 'text-kathal-400' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
        </div>
        <span className="text-4xl opacity-20">{icon}</span>
      </div>
    </div>
  )
}

function ProgressBar({ percent, color = 'bg-kathal-500' }) {
  return (
    <div className="w-full bg-gray-800 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  )
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function Dashboard() {
  const { data: metrics, loading } = useApi('/metrics')
  const { data: containers } = useApi('/containers?all=true')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-lg">Loading dashboard...</div>
      </div>
    )
  }

  const sys = metrics?.system || {}
  const docker = metrics?.docker || {}

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-500 mt-1">System overview and real-time metrics</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon="🖥️"
          label="CPU Usage"
          value={`${(sys.cpu || 0).toFixed(1)}%`}
          sub={`${sys.cpuCores || 0} cores`}
          color={sys.cpu > 80 ? 'text-red-400' : 'text-kathal-400'}
        />
        <MetricCard
          icon="🧠"
          label="Memory"
          value={`${(sys.memory?.percent || 0).toFixed(1)}%`}
          sub={`${formatBytes(sys.memory?.used)} / ${formatBytes(sys.memory?.total)}`}
          color={sys.memory?.percent > 80 ? 'text-red-400' : 'text-blue-400'}
        />
        <MetricCard
          icon="💾"
          label="Disk"
          value={`${(sys.disk?.percent || 0).toFixed(1)}%`}
          sub={`${formatBytes(sys.disk?.used)} / ${formatBytes(sys.disk?.total)}`}
          color={sys.disk?.percent > 80 ? 'text-red-400' : 'text-green-400'}
        />
        <MetricCard
          icon="🐳"
          label="Docker"
          value={docker.containersRunning || 0}
          sub={`${docker.containersStopped || 0} stopped · ${docker.imagesCount || 0} images`}
          color="text-cyan-400"
        />
      </div>

      {/* CPU + Memory bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">CPU</h3>
          <ProgressBar percent={sys.cpu || 0} />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Load 1m: {sys.load?.load1?.toFixed(2) || '0'}</span>
            <span>Load 5m: {sys.load?.load5?.toFixed(2) || '0'}</span>
            <span>Load 15m: {sys.load?.load15?.toFixed(2) || '0'}</span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Memory</h3>
          <ProgressBar percent={sys.memory?.percent || 0} color="bg-blue-500" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Used: {formatBytes(sys.memory?.used)}</span>
            <span>Available: {formatBytes(sys.memory?.available)}</span>
          </div>
        </div>
      </div>

      {/* Network */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Network</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Upload</p>
            <p className="text-lg font-mono text-green-400">{formatBytes(sys.network?.bytesSent)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Download</p>
            <p className="text-lg font-mono text-blue-400">{formatBytes(sys.network?.bytesRecv)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Packets Sent</p>
            <p className="text-lg font-mono text-green-400">{sys.network?.packetsSent || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Packets Recv</p>
            <p className="text-lg font-mono text-blue-400">{sys.network?.packetsRecv || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent containers */}
      {containers && containers.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Running Containers</h3>
          <div className="space-y-3">
            {containers.filter(c => c.state === 'running').slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.image}</p>
                  </div>
                </div>
                <div className="text-right">
                  {c.ports?.map((p, i) => (
                    <span key={i} className="text-xs bg-gray-700 px-2 py-1 rounded ml-1">
                      {p.hostPort}:{p.containerPort}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
