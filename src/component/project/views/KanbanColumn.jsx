import { SortableContext } from "@dnd-kit/sortable";
import { Edit3, MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DroppableArea } from "../DroppableArea";
import { SortableTaskCard } from "../SortableTaskCard";

import {
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const KanbanColumn = ({
  column,
  onAddTask,
  onEditColumn,
  handleEditTitle,
  handleDeleteSection,
  onTaskClick,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-wih-800 rounded-lg p-4 flex flex-col min-w-[280px] max-w-[320px] relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-wih-50 flex items-center gap-2">
          {column.title}
          <span className="text-xs text-wih-400 bg-wih-700 px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
        </h3>

        {/* Dropdown button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-wih-400 hover:text-wih-50 transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-wih-700 rounded-lg shadow-lg z-10 border border-wih-600">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleEditTitle(column.id);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-wih-600 text-wih-50"
              >
                <Edit3 size={14} />
                Edit Title
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleDeleteSection(column.id);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-red-600 text-red-400"
              >
                <Trash2 size={14} />
                Delete Section
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks - SortableContext for this column */}
      <SortableContext
        items={column.tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <DroppableArea id={column.id}>
          {column.tasks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-wih-400 text-sm">
              Drop tasks here
            </div>
          ) : (
            column.tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
              />
            ))
          )}
        </DroppableArea>
      </SortableContext>

      {/* Add Task button */}
      <button
        onClick={onAddTask}
        className="mt-4 w-full py-2 text-sm text-wih-400 hover:text-wih-50 hover:bg-wih-700 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        + Add task
      </button>
    </div>
  );
};

export default KanbanColumn;