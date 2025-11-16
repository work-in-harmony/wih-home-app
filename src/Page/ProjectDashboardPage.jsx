import { WS, SECTIONS, TASKS } from "../config/urls.jsx";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "../component/Sidebar";
import MainHeader from "../component/MainHeader";
import {
  Calendar,
  Edit3,
  MoreVertical,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";

// Task Details Sidebar
import { Save, XCircle } from "lucide-react";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import CreateTaskModal from "../component/task/CreateTaskModal";
import TaskListView from "./projectPage/ProjectListView";

// DnD Kit imports
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { NavigationTabs } from "../component/project/NavigationTabs";
import { PermissionDeniedPopup } from "../component/project/PermissionDeniedPopup";
import { TaskComments } from "../component/project/TaskComments";
import { SortableTaskCard } from "../component/project/SortableTaskCard";
import { TaskOverlay } from "../component/project/TaskOverlay";
import { DroppableArea } from "../component/project/DroppableArea";

import KanbanColumn from "../component/project/views/KanbanColumn";

import TaskDetailsSidebar from "../component/task/TaskDetailsSidebar";
import GroupChat from "../component/project/chat/GroupChat";
import SearchBar from "../component/task/SearchBar";

function ProjectDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Board");
  const [project, setProject] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  // Task details sidebar
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // Drag and Drop state
  const [activeTask, setActiveTask] = useState(null);

  const { projectId } = useParams();

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {

    const socket = new SockJS(WS.base());

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Connected to WebSocket");

        // Subscribe to section added
        stompClient.subscribe("/topic/sections", (message) => {
          if (message.body) {
            const newSection = JSON.parse(message.body);
            console.log("📩 New section received:", newSection);
            setColumns((prevColumns) => {
              if (prevColumns.some((col) => col.id === newSection.id)) {
                return prevColumns;
              }
              const updated = [
                ...prevColumns,
                {
                  id: newSection.id,
                  title: newSection.sectionName,
                  orderNumber: newSection.orderNumber,
                  tasks: [],
                },
              ];
              updated.sort((a, b) => a.orderNumber - b.orderNumber);
              return updated;
            });
          }
        });

        // Section deleted
        stompClient.subscribe("/topic/sections/deleted", (message) => {
          if (message.body) {
            const deletedSectionId = message.body.replace(/"/g, "");
            console.log("🗑️ Section deleted:", deletedSectionId);
            setColumns((prev) =>
              prev.filter((col) => col.id !== deletedSectionId)
            );
          }
        });

        // Section updated
        stompClient.subscribe("/topic/sections/update", (message) => {
          if (message.body) {
            const updatedSections = JSON.parse(message.body);
            console.log("🔄 Updated section list:", updatedSections);
            setColumns(
              updatedSections.map((s) => ({
                id: s.id,
                title: s.sectionName,
                orderNumber: s.orderNumber,
                tasks: [],
              }))
            );
          }
        });

        // New task created
        stompClient.subscribe("/topic/tasks", (message) => {
          if (message.body) {
            const newTask = JSON.parse(message.body);
            console.log("📩 New task received:", newTask);

            setColumns((prev) =>
              prev.map((col) =>
                col.id === newTask.sectionId
                  ? { ...col, tasks: [...col.tasks, newTask] }
                  : col
              )
            );
          }
        });

        // Task moved between sections
        stompClient.subscribe("/topic/tasks/moved", (message) => {
          if (message.body) {
            const movedTask = JSON.parse(message.body);
            console.log("🔄 Task moved:", movedTask);

            setColumns((prev) => {
              // Remove task from old section
              const withoutTask = prev.map((col) => ({
                ...col,
                tasks: col.tasks.filter((t) => t.id !== movedTask.id),
              }));

              // Add task to new section
              return withoutTask.map((col) =>
                col.id === movedTask.sectionId
                  ? { ...col, tasks: [...col.tasks, movedTask] }
                  : col
              );
            });
          }
        });
      },

      onStompError: (frame) => {
        console.error("❌ Broker error:", frame.headers["message"]);
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient && stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, []);

  const fetchSections = async () => {
    try {
      console.log("Fetching sections for project:", projectId);

      const sectionResponse = await fetch(
        SECTIONS.byProject(projectId)
      );
      if (!sectionResponse.ok) throw new Error("Failed to fetch sections");

      const sectionsData = await sectionResponse.json();

      const mappedColumns = sectionsData.map((section) => ({
        id: section.id,
        title: section.sectionName,
        orderNumber: section.orderNumber,
        tasks: [],
      }));

      const taskResponse = await fetch(
        TASKS.byProject(projectId)
      );
      if (!taskResponse.ok) throw new Error("Failed to fetch tasks");
      const tasksData = await taskResponse.json();

      const sectionMap = {};
      for (const section of mappedColumns) {
        sectionMap[section.id] = { ...section, tasks: [] };
      }

      for (const task of tasksData) {
        if (sectionMap[task.sectionId]) {
          sectionMap[task.sectionId].tasks.push(task);
        }
      }

      const finalColumns = Object.values(sectionMap);
      finalColumns.sort((a, b) => a.orderNumber - b.orderNumber);

      setColumns(finalColumns);

      setProject({
        projectName: "Project Dashboard",
        status: "Active",
      });
    } catch (err) {
      console.error("❌ Error loading project data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    const sectionName = prompt("Enter section name:");
    if (sectionName && sectionName.trim()) {
      try {
        const response = await fetch(SECTIONS.create(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sectionName: sectionName.trim(),
            projectId: projectId,
          }),
        });

        if (response.ok) {
          fetchSections();
        } else {
          console.error("Failed to create section");
        }
      } catch (err) {
        console.error("Error creating section:", err);
      }
    }
  };

  const handleEditColumn = (columnId) => {
    console.log("Edit column", columnId);
  };

  const handleEditTitle = async (columnId) => {
    const newTitle = prompt("Enter new section title:");
    if (newTitle && newTitle.trim()) {
      try {
        const response = await fetch(
          SECTIONS.update(columnId),
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sectionName: newTitle.trim() }),
          }
        );

        if (response.ok) {
          setColumns((prev) =>
            prev.map((col) =>
              col.id === columnId ? { ...col, title: newTitle.trim() } : col
            )
          );
        } else {
          console.error("Failed to update section");
        }
      } catch (err) {
        console.error("Error updating section:", err);
      }
    }
  };

  const handleDeleteSection = async (columnId) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      try {
        const response = await fetch(
          SECTIONS.remove(columnId),
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setColumns((prev) => prev.filter((col) => col.id !== columnId));
        } else {
          console.error("Failed to delete section");
        }
      } catch (err) {
        console.error("Error deleting section:", err);
      }
    }
  };

  const handleAddTask = (sectionId) => {
    setSelectedSectionId(sectionId);
    setIsTaskModalOpen(true);
  };

  const handleTaskCreated = (newTask) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === newTask.sectionId
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    );
  };

  const handleTaskClick = (task) => {
    console.log("THIS IS THE TASK CLIKED " + JSON.stringify(task));

    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  // Drag and Drop Handlers
  const handleDragStart = (event) => {
    const { active } = event;

    // Find the task being dragged
    let foundTask = null;
    for (const col of columns) {
      const task = col.tasks.find((t) => t.id === active.id);
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

    // Find which column the active task belongs to
    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );

    // Find which column we're over (could be empty section or task)
    let overColumn = columns.find((col) => col.id === overId);

    if (!overColumn) {
      // If not hovering over section directly, find by task
      overColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === overId)
      );
    }

    if (!activeColumn || !overColumn) return;

    // If dropping in a different column
    if (activeColumn.id !== overColumn.id) {
      setColumns((prev) => {
        const activeItems = activeColumn.tasks;
        const overItems = overColumn.tasks;

        const activeIndex = activeItems.findIndex((t) => t.id === activeId);
        const overIndex = overItems.findIndex((t) => t.id === overId);

        let newOverItems;
        if (overId === overColumn.id || overItems.length === 0) {
          // Dropping on empty column or column itself
          newOverItems = [...overItems, activeItems[activeIndex]];
        } else {
          // Dropping on a specific task
          newOverItems = [
            ...overItems.slice(0, overIndex),
            activeItems[activeIndex],
            ...overItems.slice(overIndex),
          ];
        }

        return prev.map((col) => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== activeId),
            };
          }
          if (col.id === overColumn.id) {
            return {
              ...col,
              tasks: newOverItems,
            };
          }
          return col;
        });
      });
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find which column the task ended up in
    let targetColumn = columns.find((col) => col.id === overId);

    if (!targetColumn) {
      targetColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === activeId)
      );
    }

    if (!targetColumn) return;

    // Find the task
    const task = targetColumn.tasks.find((t) => t.id === activeId);

    if (!task) return;

    // If the task moved to a different section, update backend
    if (task.sectionId !== targetColumn.id) {
      try {
        const response = await fetch(
          TASKS.move(activeId, targetColumn.id),
          {
            method: "PUT",
          }
        );

        if (!response.ok) {
          console.error("Failed to move task");
          // Optionally revert the change
          fetchSections();
        } else {
          // Keep the open sidebar in sync if this is the selected task
          if (selectedTask?.id === activeId) {
            setSelectedTask((prev) => (prev ? { ...prev, sectionId: targetColumn.id } : prev));
          }
        }
      } catch (err) {
        console.error("Error moving task:", err);
        fetchSections();
      }
    }
  };

  // Helper used by List view to persist moves
  const moveTaskToSection = async (taskId, newSectionId) => {
    try {
      const response = await fetch(
        TASKS.move(taskId, newSectionId),
        { method: "PUT" }
      );

      if (!response.ok) {
        console.error("Failed to move task from list view");
        await fetchSections();
        return;
      }

      // Optimistically update local columns; websocket will also sync
      setColumns((prev) => {
        const movedTask = prev.flatMap((c) => c.tasks).find((t) => t.id === taskId);
        if (!movedTask) return prev;
        const without = prev.map((c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }));
        return without.map((c) =>
          c.id === newSectionId ? { ...c, tasks: [...c.tasks, { ...movedTask, sectionId: newSectionId }] } : c
        );
      });
    } catch (err) {
      console.error("Error moving task (list view):", err);
      await fetchSections();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-wih-900 text-wih-50">
        <div className="text-lg">Loading sections...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-wih-900 text-wih-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MainHeader
          setSidebarOpen={setSidebarOpen}
          projectName={project?.projectName || "Project Dashboard"}
          currentStatus={project?.status || "Active"}
          onStatusChange={() => console.log("Change status")}
        />

        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {/* <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} /> */}

        <div className="px-4 py-2">
          <SearchBar
            projectId={projectId}
            onSelectTask={(task) => {
              setSelectedTask(task);
              setIsTaskDetailOpen(true);
            }}
          />
        </div>


        {activeTab === "Board" ? (
          <>
            <div className="bg-wih-900 px-4 py-3 border-b border-wih-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="px-3 py-1.5 bg-wih-700 hover:bg-wih-600 rounded-lg text-sm transition-colors flex items-center gap-2">
                    <Plus size={16} />
                    <span>Add task</span>
                  </button>
                  <button
                    onClick={handleAddSection}
                    className="px-3 py-1.5 bg-wih-700 hover:bg-wih-600 rounded-lg text-sm transition-colors"
                  >
                    + Add section
                  </button>
                </div>
                <button className="px-3 py-1.5 bg-wih-700 hover:bg-wih-600 rounded-lg text-sm transition-colors">
                  Group by
                </button>
              </div>
            </div>

            <main className="flex-1 overflow-x-auto overflow-y-hidden p-4 lg:p-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <div className="flex gap-4 h-full">
                  {columns.length === 0 ? (
                    <div className="flex items-center justify-center w-full text-wih-400">
                      <p>No sections yet. Click "+ Add section" to create one.</p>
                    </div>
                  ) : (
                    columns.map((column) => (
                      <KanbanColumn
                        key={column.id}
                        column={column}
                        onAddTask={() => handleAddTask(column.id)}
                        onEditColumn={() => handleEditColumn(column.id)}
                        handleEditTitle={handleEditTitle}
                        handleDeleteSection={handleDeleteSection}
                        onTaskClick={handleTaskClick}
                      />
                    ))
                  )}
                </div>
                <DragOverlay>
                  {activeTask ? <TaskOverlay task={activeTask} /> : null}
                </DragOverlay>
              </DndContext>
            </main>
          </>
        ) : activeTab === "List" ? (
          <TaskListView
            embedded
            columns={columns}
            updateColumns={setColumns}
            onTaskClick={handleTaskClick}
            onAddSection={handleAddSection}
            onAddTask={handleAddTask}
            onMoveTask={moveTaskToSection}
          />
        ) : activeTab === "Group Chat" ? (
          <GroupChat
            projectId={projectId}
            currentUserEmail={localStorage.getItem("email")} // TODO: Replace with actual user from auth context
            currentUserRole="EDITOR"
            projectName={project?.projectName || "Project Dashboard"}
          />
        ) : null}
      </div>

      {/* Task Details Sidebar */}
      <TaskDetailsSidebar
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        projectId={projectId}
        sectionName={
          selectedTask
            ? (columns.find((c) => c.id === selectedTask.sectionId)?.title || "Unknown")
            : undefined
        }
        onClose={() => {
          setIsTaskDetailOpen(false);
          setSelectedTask(null);
        }}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        sectionId={selectedSectionId}
        projectId={projectId}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}

export default ProjectDashboardPage;
