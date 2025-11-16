export const PermissionDeniedPopup = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose} />

      {/* Popup box */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-wih-800 text-wih-50 rounded-2xl shadow-xl p-6 w-[90%] max-w-sm border border-wih-700">
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            Permission Denied
          </h2>
          <p className="text-sm text-wih-50/80">
            🚫 You are not allowed to update this section.
          </p>

          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-wih-700 hover:bg-wih-600 text-wih-50 transition"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
