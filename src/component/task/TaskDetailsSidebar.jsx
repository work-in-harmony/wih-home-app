import { Calendar, Edit3, Save, X, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { TaskComments } from "../project/TaskComments";
import { PermissionDeniedPopup } from "../project/PermissionDeniedPopup";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const UserCard = React.lazy(() => import("HostApp/UserCard"));

const TaskDetailsSidebar = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
  projectId,
  sectionName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [showForbiddenPopup, setShowForbiddenPopup] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMemberEmail, setSelectedMemberEmail] = useState("");
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);

  const handleChange = (field, value) => {
    setEditedTask((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:8050/tasks/update/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": localStorage.getItem("email"),
          },
          body: JSON.stringify(editedTask),
        }
      );

      if (response.status === 403) {
        setShowForbiddenPopup(true);
        return;
      }
      if (response.ok) {
        const updated = await response.json();
        onTaskUpdated && onTaskUpdated(updated);
        setIsEditing(false);
      } else {
        console.error("❌ Failed to update task");
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleAiResponse = async () => {
    setIsAiLoading(true);
    setAiResponse("");

    const request = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
    };

    try {
      const response = await fetch(
        "http://localhost:8050/tasks/generate-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("this is the ai response ", data);
        setAiResponse(data.plan);
      } else {
        console.error("Failed to get AI response");
        setAiResponse("Error: Could not generate a plan.");
      }
    } catch (err) {
      console.error("Error fetching AI response:", err);
      setAiResponse("Error: Network failure.");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) return;
      try {
        setIsMembersLoading(true);
        setMembersError(null);
        const response = await fetch(
          "http://localhost:8050/project/list/members",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to load members (${response.status})`);
        }

        const data = await response.json();
        const list = data?.projectMembers || [];
        setMembers(list);
        if (!selectedMemberEmail && list.length > 0) {
          setSelectedMemberEmail(list[0].memberEmail);
        }
      } catch (err) {
        console.error("Error fetching project members:", err);
        setMembersError(err.message || "Unable to load members");
        setMembers([]);
      } finally {
        setIsMembersLoading(false);
      }
    };

    if (isOpen) fetchMembers();
  }, [projectId, isOpen]);

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "LOW":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  if (!isOpen || !task) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[700px] bg-wih-800 shadow-2xl z-50 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-wih-700">
            <h2 className="text-2xl font-bold text-wih-50">Task Details</h2>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="text-green-400 hover:text-green-300 p-2 hover:bg-green-400/10 rounded-lg transition-all"
                    title="Save"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTask(task);
                    }}
                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Cancel"
                  >
                    <XCircle size={20} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditedTask(task);
                  }}
                  className="text-wih-400 hover:text-wih-50 p-2 hover:bg-wih-700 rounded-lg transition-all"
                  title="Edit Task"
                >
                  <Edit3 size={20} />
                </button>
              )}

              <button
                onClick={onClose}
                className="text-wih-400 hover:text-wih-50 p-2 hover:bg-wih-700 rounded-lg transition-all"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Call Member Section */}
          <div className="mb-8 p-4 bg-wih-700/30 rounded-lg border border-wih-700">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-2 block">
                  Call Member
                </label>
                <select
                  className="w-full bg-wih-700 text-wih-50 p-2.5 rounded-md border border-wih-600 focus:border-wih-500 focus:outline-none"
                  value={selectedMemberEmail}
                  onChange={(e) => setSelectedMemberEmail(e.target.value)}
                  disabled={isMembersLoading || members.length === 0}
                >
                  {isMembersLoading ? (
                    <option>Loading members...</option>
                  ) : members.length === 0 ? (
                    <option>No members</option>
                  ) : (
                    members.map((m) => (
                      <option key={m.memberEmail} value={m.memberEmail}>
                        {m.memberEmail} ({m.memberRole})
                      </option>
                    ))
                  )}
                </select>
              </div>
              {selectedMemberEmail && <UserCard email={selectedMemberEmail} />}
            </div>
          </div>

           {/* Section */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
              Section
            </label>
            <div className="inline-flex items-center justify-center text-xs font-bold px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              {sectionName || "—"}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full bg-wih-700 text-wih-50 p-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
                value={editedTask.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            ) : (
              <div className="text-lg font-semibold text-wih-50">
                {task.title}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
              Description
            </label>
            {isEditing ? (
              <textarea
                className="w-full bg-wih-700 text-wih-200 p-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none min-h-[120px] resize-y"
                value={editedTask.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            ) : (
              <div className="text-sm text-wih-300 whitespace-pre-wrap leading-relaxed">
                {task.description || "No description"}
              </div>
            )}
          </div>

          {/* Priority & Status Row */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
                Priority
              </label>
              {isEditing ? (
                <select
                  className="w-full bg-wih-700 text-wih-50 p-2.5 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
                  value={editedTask.priority || "LOW"}
                  onChange={(e) => handleChange("priority", e.target.value)}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              ) : (
                <div
                  className={`inline-flex items-center justify-center text-xs font-bold px-4 py-2 rounded-lg ${getPriorityStyles(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
                Status
              </label>
              {isEditing ? (
                <select
                  className="w-full bg-wih-700 text-wih-50 p-2.5 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
                  value={editedTask.status || "TASK_ASSIGNED"}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="TASK_ASSIGNED">TASK_ASSIGNED</option>
                  <option value="TASK_IN_PROGRESS">TASK_IN_PROGRESS</option>
                  <option value="TASK_COMPLETED">TASK_COMPLETED</option>
                  <option value="TASK_VERIFIED">TASK_VERIFIED</option>
                  <option value="TASK_OVERDUE">TASK_OVERDUE</option>
                  <option value="TASK_CANCELED">TASK_CANCELED</option>
                </select>
              ) : (
                <div className="text-sm font-medium text-wih-50 bg-wih-700/50 px-4 py-2 rounded-lg inline-block">
                  {task.status}
                </div>
              )}
            </div>
          </div>

         

          {/* Due Date */}
          <div className="mb-8">
            <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
              Due Date
            </label>
            <div className="flex items-center gap-3 bg-wih-700/50 px-4 py-3 rounded-lg">
              <Calendar size={18} className="text-wih-400" />
              {isEditing ? (
                <input
                  type="date"
                  className="bg-transparent text-wih-200 focus:outline-none flex-1"
                  value={
                    editedTask.dueDate
                      ? new Date(editedTask.dueDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                />
              ) : (
                <span className="text-sm text-wih-200">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No due date"}
                </span>
              )}
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="mb-8">
            <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
              Subtasks
            </label>

            {editedTask?.subTask && editedTask.subTask.length > 0 ? (
              <div className="space-y-3">
                {editedTask.subTask.map((sub, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-wih-700/40 px-4 py-3 rounded-lg border border-wih-700 hover:bg-wih-700/60 transition"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={async () => {
                        try {
                          const response = await fetch(
                            `http://localhost:8050/tasks/${task.id}/subtask/${index}`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                            }
                          );

                          if (response.ok) {
                            const updatedTask = await response.json();
                            setEditedTask(updatedTask);
                          } else {
                            console.error("❌ Failed to update subtask");
                          }
                        } catch (err) {
                          console.error("Error updating subtask:", err);
                        }
                      }}
                      className="mt-1 w-4 h-4 accent-wih-600 cursor-pointer"
                    />

                    <div className="flex-1">
                      <div
                        className={`text-sm font-medium text-wih-50 ${
                          sub.completed ? "line-through text-wih-400" : ""
                        }`}
                      >
                        {sub.title}
                      </div>
                      {sub.description && (
                        <div className="text-xs text-wih-400 mt-1">
                          {sub.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-wih-500 text-sm italic px-4 py-6 bg-wih-700/20 rounded-lg text-center">
                No subtasks added.
              </p>
            )}
          </div>

          {/* AI Generated Plan Section */}
          <div className="mb-8">
            <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
              AI Generated Plan
            </label>

            <div className="relative bg-wih-700/30 border border-wih-700 rounded-xl p-5 shadow-lg min-h-[250px] max-h-[500px] overflow-y-auto text-wih-100 transition-all font-sans text-sm leading-relaxed">
              {isAiLoading ? (
                <p className="text-wih-400 italic animate-pulse text-center py-8">
                  🤖 Generating your AI plan...
                </p>
              ) : aiResponse ? (
                <div className="prose prose-invert max-w-none prose-headings:text-wih-50 prose-p:text-wih-200 prose-li:text-wih-200">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiResponse}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-wih-500 italic text-center py-8">
                  Click "Generate Plan" to get an AI-powered breakdown...
                </p>
              )}
            </div>

            <button
              onClick={handleAiResponse}
              disabled={isAiLoading}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-wih-50 font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAiLoading ? "Generating..." : "Generate Plan"}
            </button>
          </div>

          {/* Links Section */}
          <div className="space-y-6 mb-8">
            {/* Git Repo */}
            <div>
              <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
                Git Repository
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full bg-wih-700 text-wih-50 p-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
                  value={editedTask.gitRepoUrl || ""}
                  onChange={(e) => handleChange("gitRepoUrl", e.target.value)}
                  placeholder="https://github.com/..."
                />
              ) : task.gitRepoUrl ? (
                <a
                  href={task.gitRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 break-all underline"
                >
                  {task.gitRepoUrl}
                </a>
              ) : (
                <span className="text-wih-500 text-sm italic">No repo linked</span>
              )}
            </div>

            {/* Google Docs */}
            <div>
              <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
                Google Docs
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full bg-wih-700 text-wih-50 p-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
                  value={editedTask.googleDocsUrl || ""}
                  onChange={(e) => handleChange("googleDocsUrl", e.target.value)}
                  placeholder="https://docs.google.com/..."
                />
              ) : task.googleDocsUrl ? (
                <a
                  href={task.googleDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 break-all underline"
                >
                  {task.googleDocsUrl}
                </a>
              ) : (
                <span className="text-wih-500 text-sm italic">No document linked</span>
              )}
            </div>
          </div>

          {/* Assignment Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
                Assigned To
              </label>
              {isEditing ? (
                <input
                  type="email"
                  className="w-full bg-wih-700 text-wih-50 p-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
                  value={editedTask.assignedToEmail || ""}
                  onChange={(e) => handleChange("assignedToEmail", e.target.value)}
                />
              ) : (
                <div className="text-sm text-wih-200">
                  {task.assignedToEmail || "Unassigned"}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-wih-400 uppercase tracking-wider mb-3 block">
                Assigned By
              </label>
              {isEditing ? (
                <input
                  type="email"
                  className="w-full bg-wih-700 text-wih-50 p-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
                  value={editedTask.createdByEmail || ""}
                  onChange={(e) => handleChange("createdByEmail", e.target.value)}
                />
              ) : (
                <div className="text-sm text-wih-200">
                  {task.createdByEmail || "Unknown"}
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-8">
            <TaskComments
              taskId={task.id}
              userEmail={localStorage.getItem("email")}
            />
          </div>

          {/* Timestamps */}
          <div className="pt-6 border-t border-wih-700 space-y-2 text-xs text-wih-400">
            {task.createdAt && (
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{new Date(task.createdAt).toLocaleString()}</span>
              </div>
            )}
            {task.updatedAt && (
              <div className="flex justify-between">
                <span className="font-medium">Updated:</span>
                <span>{new Date(task.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <PermissionDeniedPopup
          open={showForbiddenPopup}
          onClose={() => setShowForbiddenPopup(false)}
        />
      </div>
    </>
  );
};

export default TaskDetailsSidebar;
