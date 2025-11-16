import { useDroppable } from "@dnd-kit/core";

// Droppable Area Component for empty sections
export const DroppableArea = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 flex-1 overflow-y-auto min-h-[100px] rounded-lg transition-colors ${isOver ? "bg-wih-700/50" : ""}`}
    >
      {children}
    </div>
  );
};
