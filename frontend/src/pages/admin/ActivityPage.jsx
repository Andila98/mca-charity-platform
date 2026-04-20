import { useQuery } from '@tanstack/react-query'
import { FiActivity, FiImage, FiFileText } from 'react-icons/fi'
import { contentApi, imagesApi } from '../../services/api'
import { formatRelative } from '../../utils/format'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ActivityPage() {
  const { data: contentRes, isLoading: lc } = useQuery({
    queryKey: ['recent-content'],
    queryFn: () => contentApi.getRecent(20),
  })
  const { data: imagesRes, isLoading: li } = useQuery({
    queryKey: ['recent-images'],
    queryFn: () => imagesApi.getRecent(20),
  })

  const recentContent = contentRes?.data || []
  const recentImages = imagesRes?.data || []

  const combined = [
    ...recentContent.map((c) => ({ ...c, _type: 'content', _time: c.updatedAt })),
    ...recentImages.map((i) => ({ ...i, _type: 'image', _time: i.uploadedAt || i.createdAt })),
  ].sort((a, b) => new Date(b._time) - new Date(a._time))

  if (lc || li) return <LoadingSpinner />

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-gray-500 text-sm mt-1">Recent content and image updates</p>
      </div>

      <div className="max-w-2xl">
        {combined.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">No recent activity.</div>
        ) : (
          <div className="space-y-3">
            {combined.map((item, idx) => (
              <div key={idx} className="card flex items-start gap-4 py-4">
                <div className={`flex-shrink-0 p-2 rounded-lg ${item._type === 'image' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {item._type === 'image' ? <FiImage className="text-purple-600" size={18} /> : <FiFileText className="text-blue-600" size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {item._type === 'image' ? `Image uploaded: ${item.imageKey}` : `Content updated: ${item.contentKey}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {`Page: ${item.pageName}`}
                    {item.updatedBy && ` · By ${item.updatedBy}`}
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatRelative(item._time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
