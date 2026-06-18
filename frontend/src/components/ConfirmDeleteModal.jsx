import Modal from './Modal';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, itemName }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete <strong>{itemName || 'this item'}</strong>? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all shadow-red-500/20">
          Yes, Delete
        </button>
      </div>
    </Modal>
  );
}
