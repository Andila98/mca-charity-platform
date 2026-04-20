import { STATUS_COLORS } from '../../utils/constants'
import clsx from 'clsx'

export default function StatusBadge({ status }) {
  return (
    <span className={clsx('badge', STATUS_COLORS[status] || 'bg-gray-100 text-gray-800')}>
      {status}
    </span>
  )
}
