// Task Card for DragOverlay
export const TaskOverlay = ({ task }) => {
  if (!task) return null;

  return (
    <div className="bg-wih-600 rounded-lg p-3 shadow-2xl space-y-1 w-[280px]">
      <div className="font-medium text-wih-50 truncate">{task.title}</div>
      {task.assignedToEmail && (
        <div className="text-xs text-wih-300">
          Assigned to:{" "}
          <span className="text-wih-200">{task.assignedToEmail}</span>
        </div>
      )}
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
