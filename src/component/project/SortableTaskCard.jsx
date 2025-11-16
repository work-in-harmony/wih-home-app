import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Task Card Component
export const SortableTaskCard = ({ task, onClick }) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Prevent click during drag
        if (!isDragging) {
          onClick(task);
        }
      }}
      className="bg-wih-600 rounded-lg p-3 hover:bg-wih-700 transition-colors cursor-grab active:cursor-grabbing space-y-1"
    >
      {/* Task Title */}
      <div className="font-medium text-wih-50 truncate">{task.title}</div>

      {/* Assigned To */}
      {task.assignedToEmail && (
        <div className="text-xs text-wih-300">
          Assigned to:{" "}
          <span className="text-wih-200">{task.assignedToEmail}</span>
        </div>
      )}

      {/* Priority */}
      {task.priority && (
        <div
          className={`text-xs font-semibold inline-block px-2 py-1 rounded-md
          ${task.priority === "HIGH"
              ? "bg-red-600/20 text-red-400"
              : task.priority === "MEDIUM"
                ? "bg-yellow-600/20 text-yellow-400"
                : "bg-green-600/20 text-green-400"}`}
        >
          {task.priority}
        </div>
      )}
    </div>
  );
};
