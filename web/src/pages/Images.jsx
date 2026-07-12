import { useApi } from '../hooks/useApi'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(ts) {
  if (!ts) return '-'
  return new Date(ts * 1000).toLocaleDateString()
}

export default function Images() {
  const { data: images, loading } = useApi('/images')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-lg">Loading images...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Images</h2>
        <p className="text-gray-500 mt-1">{images?.length || 0} Docker images</p>
      </div>

      {!images || images.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">📦</span>
          <h3 className="text-xl font-semibold text-gray-400">No images</h3>
          <p className="text-gray-600 mt-2">Docker images will appear here</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left text-sm text-gray-500">
                <th className="px-6 py-4">Repository</th>
                <th className="px-6 py-4">Tag</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {images.map(img => {
                const [repo, tag] = (img.repoTags?.[0] || 'unknown:latest').split(':')
                return (
                  <tr key={img.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{repo}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-gray-800 px-2 py-1 rounded">{tag}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">{img.id}</td>
                    <td className="px-6 py-4 text-sm">{formatBytes(img.size)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(img.created)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
