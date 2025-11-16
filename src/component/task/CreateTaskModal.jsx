import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

function CreateTaskModal({ isOpen, onClose, sectionId, projectId, onTaskCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "LOW",
    dueDate: "",
    assignedToEmail: "",
  });

  const [subTasks, setSubTasks] = useState([]);

  // Handle main form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle subtask field change
  const handleSubTaskChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...subTasks];
    updated[index][name] = value;
    setSubTasks(updated);
  };

  // Add a new subtask row
  const addSubTask = () => {
    setSubTasks([...subTasks, { title: "", description: "", completed: false }]);
  };

  // Remove a subtask
  const removeSubTask = (index) => {
    setSubTasks(subTasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Task title is required.");

    const taskData = {
      ...formData,
      projectId,
      sectionId,
      subTaskDtos: subTasks,
      status: "TASK_ASSIGNED",
      createdByEmail: localStorage.getItem("email") || "demo@user.com",
    };

    try {
      const response = await fetch("http://localhost:8050/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const newTask = await response.json();
        onTaskCreated(newTask);
        onClose();
      } else {
        console.error("❌ Failed to create task");
      }
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-wih-800 w-[450px] rounded-2xl shadow-xl border border-wih-700 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-wih-50">Create Task</h3>
          <button onClick={onClose} className="text-wih-400 hover:text-wih-50">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm text-wih-400">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-wih-700 text-wih-50 focus:outline-none focus:ring-1 focus:ring-wih-600"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-wih-400">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-wih-700 text-wih-50 focus:outline-none focus:ring-1 focus:ring-wih-600"
              placeholder="Enter description"
            />
          </div>

          {/* Priority & Due Date */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-wih-400">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-wih-700 text-wih-50 focus:outline-none focus:ring-1 focus:ring-wih-600"
              >
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-sm text-wih-400">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-wih-700 text-wih-50 focus:outline-none focus:ring-1 focus:ring-wih-600"
              />
            </div>
          </div>

          {/* Assigned Email */}
          <div>
            <label className="text-sm text-wih-400">Assign To (Email)</label>
            <input
              type="email"
              name="assignedToEmail"
              value={formData.assignedToEmail}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-wih-700 text-wih-50 focus:outline-none focus:ring-1 focus:ring-wih-600"
              placeholder="example@email.com"
            />
          </div>

          {/* Subtasks Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-wih-400">Subtasks</label>
              <button
                type="button"
                onClick={addSubTask}
                className="flex items-center gap-1 text-wih-400 hover:text-wih-50 text-sm"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {subTasks.map((sub, index) => (
              <div
                key={index}
                className="flex gap-2 mb-2 bg-wih-700 p-2 rounded-lg items-center"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    name="title"
                    value={sub.title}
                    onChange={(e) => handleSubTaskChange(index, e)}
                    placeholder="Subtask title"
                    className="w-full px-2 py-1 rounded bg-wih-800 text-wih-50 focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    name="description"
                    value={sub.description}
                    onChange={(e) => handleSubTaskChange(index, e)}
                    placeholder="Subtask description"
                    className="w-full mt-1 px-2 py-1 rounded bg-wih-800 text-wih-50 focus:outline-none text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSubTask(index)}
                  className="text-wih-400 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-wih-700 text-wih-400 hover:text-wih-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-wih-600 text-wih-50 hover:bg-wih-500 transition"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
