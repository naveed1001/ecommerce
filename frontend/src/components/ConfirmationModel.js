import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, itemType, itemId }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false); // Reset success state when modal closes
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    try {
      await onConfirm(itemId);
      setShowSuccess(true); // Show success modal
      setTimeout(() => {
        setShowSuccess(false);
        onClose(); // Close modal after 1.5s
      }, 1500);
    } catch (err) {
      console.error('Deletion failed:', err);
      onClose(); // Close modal on error
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100/50 p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out scale-0 animate-[fadeScaleIn_0.3s_ease-in-out_forwards]">
        {showSuccess ? (
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-green-500 text-4xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Deleted!</h2>
            <p className="text-gray-600 text-center">
              {itemType.charAt(0).toUpperCase() + itemType.slice(1)} successfully deleted.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Are you sure?</h2>
            <p className="text-gray-600 text-center mb-6">
              You are about to delete {itemType} "<strong>{itemName || itemId}</strong>". This action cannot be undone.
            </p>
            <div className="flex space-x-4 w-full">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
              >
                Confirm
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationModal;

// Custom animation keyframes
const styles = `
  @keyframes fadeScaleIn {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}