import Modal from './Modal'
import { FiAlertTriangle } from 'react-icons/fi'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3 mb-6">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <FiAlertTriangle className={danger ? 'text-red-600' : 'text-yellow-600'} size={20} />
        </div>
        <p className="text-sm text-gray-600 self-center">{message}</p>
      </div>
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={() => { onConfirm(); onClose() }}>
          Confirm
        </button>
      </div>
    </Modal>
  )
}
