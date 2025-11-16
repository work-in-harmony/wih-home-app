import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Edit3,
  MoreVertical,
  Plus,
  Trash2,
  User,
  X,
  Save,
  XCircle,
} from "lucide-react";

// DnD Kit imports
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// No mock data; sections come from parent via props

// Navigation Tabs Component
const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = ["List", "Board", "Dashboard", "Logs"];

  return (
    <div className="bg-[#212121] border-b border-[#353535]">
      <div className="flex gap-6 px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab ? "text-[#ececec]" : "text-[#9ca3af] hover:text-[#ececec]"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ececec]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Sortable List Task Row Component
const SortableListTaskRow = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-600/20 text-red-400";
      case "MEDIUM":
        return "bg-yellow-600/20 text-yellow-400";
      case "LOW":
        return "bg-green-600/20 text-green-400";
      default:
        return "bg-[#353535] text-[#9ca3af]";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!isDragging) {
          onClick(task);
        }
      }}
      className="grid grid-cols-5 gap-4 px-6 py-3 hover:bg-[#353535] transition-colors cursor-grab active:cursor-grabbing border-b border-[#353535]"
    >
      <div className="text-sm text-[#ececec] truncate">{task.title}</div>
      <div className="flex items-center">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-md ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority || "LOW"}
        </span>
      </div>
      <div className="text-sm text-[#d1d5db]">
        {task.dueDate
          ? new Date(task.dueDate).toLocaleDateString()
          : "No due date"}
      </div>
      <div className="text-sm text-[#d1d5db]">
        {task.createdAt
          ? new Date(task.createdAt).toLocaleDateString()
          : "N/A"}
      </div>
      <div className="flex items-center gap-2 text-sm text-[#d1d5db]">
        {task.assignedToEmail ? (
          <>
            <User size={14} />
            <span className="truncate">{task.assignedToEmail}</span>
          </>
        ) : (
          <span className="text-[#6b7280]">Unassigned</span>
        )}
      </div>
    </div>
  );
};

// List Section Component
const ListSection = ({ section, onTaskClick, isExpanded, onToggle, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id: section.id });
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-3 bg-[#212121] hover:bg-[#353535] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-[#ececec] transform transition-transform">
            {isExpanded ? "▼" : "▶"}
          </span>
          <span className="font-medium text-[#ececec]">{section.title}</span>
          <span className="text-xs text-[#9ca3af] bg-[#353535] px-2 py-0.5 rounded-full">
            {section.tasks.length}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div
          ref={setNodeRef}
          className={`bg-[#181818] ${isOver ? "outline outline-1 outline-[#424242] bg-[#1f1f1f]" : ""}`}
        >
          <SortableContext
            items={section.tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {section.tasks.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#6b7280] text-sm">
                No tasks in this section
              </div>
            ) : (
              section.tasks.map((task) => (
                <SortableListTaskRow
                  key={task.id}
                  task={task}
                  onClick={onTaskClick}
                />
              ))
            )}
          </SortableContext>
          <button
            onClick={() => onAddTask && onAddTask(section.id)}
            className="mt-2 w-full py-2 text-sm text-[#9ca3af] hover:text-[#ececec] hover:bg-[#2a2a2a] rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>Add task</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function TaskListView({
  embedded = false,
  columns = [], // [{id,title,orderNumber,tasks:[]}]
  onTaskClick = () => {},
  onAddSection = null,
  onAddTask = null, // optional; when provided, call with a section id or handle selection elsewhere
  onMoveTask = null, // (taskId, newSectionId) => Promise
  updateColumns = null, // function to update parent columns state (prev => next)
}) {
  const [activeTab, setActiveTab] = useState("List");
  const [sections, setSections] = useState(columns);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTask, setActiveTask] = useState(null);

  // Sync sections from parent and initialize expansion
  useEffect(() => {
    setSections(columns);
  }, [columns]);

  useEffect(() => {
    const expanded = { ...expandedSections };
    sections.forEach((section) => {
      if (expanded[section.id] === undefined) expanded[section.id] = true;
    });
    setExpandedSections(expanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleTaskClick = (task) => {
    onTaskClick && onTaskClick(task);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    let foundTask = null;
    for (const section of sections) {
      const task = section.tasks.find((t) => t.id === active.id);
      if (task) {
        foundTask = task;
        break;
      }
    }
    setActiveTask(foundTask);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeSection = columns.find((section) =>
      section.tasks.some((task) => task.id === activeId)
    );

    let overSection = columns.find((section) => section.id === overId);

    if (!overSection) {
      overSection = columns.find((section) =>
        section.tasks.some((task) => task.id === overId)
      );
    }

    if (!activeSection || !overSection) return;

    if (activeSection.id !== overSection.id && updateColumns) {
      updateColumns((prev) => {
        const src = prev.find((p) => p.id === activeSection.id);
        const dst = prev.find((p) => p.id === overSection.id);
        if (!src || !dst) return prev;

        const activeItems = src.tasks;
        const overItems = dst.tasks;

        const activeIndex = activeItems.findIndex((t) => t.id === activeId);
        const overIndex = overItems.findIndex((t) => t.id === overId);

        let newOverItems;
        if (overId === overSection.id || overItems.length === 0) {
          newOverItems = [...overItems, activeItems[activeIndex]];
        } else {
          newOverItems = [
            ...overItems.slice(0, Math.max(0, overIndex)),
            activeItems[activeIndex],
            ...overItems.slice(Math.max(0, overIndex)),
          ];
        }

        return prev.map((section) => {
          if (section.id === src.id) {
            return {
              ...section,
              tasks: section.tasks.filter((t) => t.id !== activeId),
            };
          }
          if (section.id === dst.id) {
            return {
              ...section,
              tasks: newOverItems,
            };
          }
          return section;
        });
      });
    }
  };

  const handleDragEnd = async (event) => {
    setActiveTask(null);
    if (!event.over) return;

    const activeId = event.active.id;
    const overId = event.over.id;

    let targetSection = columns.find((s) => s.id === overId);
    if (!targetSection) {
      targetSection = columns.find((s) => s.tasks.some((t) => t.id === activeId));
    }
    if (!targetSection) return;

    const task = columns.flatMap((s) => s.tasks).find((t) => t.id === activeId);
    if (!task) return;

    if (task.sectionId !== targetSection.id && onMoveTask) {
      try {
        await onMoveTask(activeId, targetSection.id);
      } catch (e) {
        // Optionally handle error: could refetch
        console.error('Move task failed in list view', e);
      }
    }
  };

  return (
    <>
      {embedded ? null : (
        <div className="bg-[#212121] border-b border-[#353535] px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#ececec]">Project one</h1>
            <button className="px-4 py-2 bg-[#353535] hover:bg-[#424242] rounded-lg text-sm transition-colors">
              Add members
            </button>
          </div>
        </div>
      )}

      {embedded ? null : (
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      <div className="bg-[#181818] px-4 py-3 border-b border-[#353535]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 bg-[#353535] hover:bg-[#424242] rounded-lg text-sm transition-colors flex items-center gap-2">
              <Plus size={16} />
              <span>Add task</span>
            </button>
            {onAddSection ? (
              <button
                onClick={onAddSection}
                className="px-3 py-1.5 bg-[#353535] hover:bg-[#424242] rounded-lg text-sm transition-colors"
              >
                + Add section
              </button>
            ) : (
              <button className="px-3 py-1.5 bg-[#353535] hover:bg-[#424242] rounded-lg text-sm transition-colors">
                + Add section
              </button>
            )}
          </div>
          <button className="px-3 py-1.5 bg-[#353535] hover:bg-[#424242] rounded-lg text-sm transition-colors">
            Group by
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-hidden p-4 lg:p-6">
        <div className="bg-[#212121] rounded-lg overflow-hidden h-full flex flex-col">
          {/* List Header */}
          <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-[#353535] border-b border-[#424242] sticky top-0 z-10">
            <div className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
              Name
            </div>
            <div className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
              Priority
            </div>
            <div className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
              Due Date
            </div>
            <div className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
              Created on
            </div>
            <div className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
              Assigned to
            </div>
          </div>

          {/* List Content with DnD */}
          <div className="flex-1 overflow-y-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {sections.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[#9ca3af]">
                  <p>No sections yet. Click "+ Add section" to create one.</p>
                </div>
              ) : (
                sections.map((section) => (
                  <ListSection
                    key={section.id}
                    section={section}
                    onTaskClick={handleTaskClick}
                    isExpanded={expandedSections[section.id]}
                    onToggle={() => toggleSection(section.id)}
                    onAddTask={onAddTask}
                  />
                ))
              )}
              <DragOverlay>
                {activeTask ? (
                  <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-[#424242] rounded shadow-2xl border border-[#6b7280]">
                    <div className="text-sm text-[#ececec] truncate">
                      {activeTask.title}
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-md ${
                          activeTask.priority === "HIGH"
                            ? "bg-red-600/20 text-red-400"
                            : activeTask.priority === "MEDIUM"
                            ? "bg-yellow-600/20 text-yellow-400"
                            : "bg-green-600/20 text-green-400"
                        }`}
                      >
                        {activeTask.priority || "LOW"}
                      </span>
                    </div>
                    <div className="text-sm text-[#d1d5db]">
                      {activeTask.dueDate
                        ? new Date(activeTask.dueDate).toLocaleDateString()
                        : "No due date"}
                    </div>
                    <div className="text-sm text-[#d1d5db]">
                      {activeTask.createdAt
                        ? new Date(activeTask.createdAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#d1d5db]">
                      {activeTask.assignedToEmail ? (
                        <>
                          <User size={14} />
                          <span className="truncate">
                            {activeTask.assignedToEmail}
                          </span>
                        </>
                      ) : (
                        <span className="text-[#6b7280]">Unassigned</span>
                      )}
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </main>
    </>
  );
}
