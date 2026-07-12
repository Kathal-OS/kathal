import { useApi } from '../hooks/useApi'

export default function Settings() {
  const { data: system } = useApi('/system')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-gray-500 mt-1">System configuration and information</p>
      </div>

      <div className="space-y-6">
        {/* System Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">System Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Version</p>
              <p className="font-mono">{system?.version || 'unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Go Runtime</p>
              <p className="font-mono">{system?.goVersion || 'unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Docker</p>
              <p className="font-mono">
                {system?.docker ? (
                  <span className="text-green-400">✓ Connected</span>
                ) : (
                  <span className="text-red-400">✗ Not connected</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Deploy */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Deploy</h3>
          <p className="text-sm text-gray-500 mb-4">
            Deploy a new container from the command line:
          </p>
          <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-gray-400">
            <p># Pull and run a container</p>
            <p className="text-kathal-400">docker run -d --name my-app -p 3000:3000 nginx:alpine</p>
            <p className="mt-2"># Using KATHAL CLI (coming soon)</p>
            <p className="text-kathal-400">kathal deploy nginx:alpine --port 3000</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-900 border border-red-900/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h3>
          <div className="space-y-3">
            <button className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm">
              🗑️ Remove KATHAL
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            This will stop and remove the KATHAL container. Your data in /data will be preserved.
          </p>
        </div>
      </div>
    </div>
  )
}
