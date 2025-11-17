import { X } from "lucide-react";
import { useEffect, useState } from "react";

function CreateProjectModal({
  isOpen,
  onClose,
  currentOrg,
  userEmail,
  onProjectCreated,
}) {
  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    startDate: "",
    endDate: "",
    gitOrg: "",
    status: "PLANNING",
    members: [],
  });

  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectName: "",
        projectDescription: "",
        startDate: "",
        endDate: "",
        gitOrg: "",
        status: "PLANNED",
        members: [],
      });
      setSelectedMembers(new Set());
      setError(null);
      console.log("ASDLJASDLJN" + JSON.stringify(currentOrg));
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberToggle = (member) => {
    setSelectedMembers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(member.email)) {
        newSet.delete(member.email);
        // Remove member from formData.members too
        setFormData((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m.memberEmail !== member.email),
        }));
      } else {
        newSet.add(member.email);
        setFormData((prev) => ({
          ...prev,
          members: [
            ...prev.members,
            { memberEmail: member.email, memberRole: "VIEWER" },
          ],
        }));
      }
      return newSet;
    });
  };

  const handleRoleChange = (email, newRole) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.memberEmail === email ? { ...m, memberRole: newRole } : m
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.projectName) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError(null);

    const members = formData.members;

    const projectData = {
      organizationName: currentOrg.orgName,
      organizationId: currentOrg.orgId,
      projectName: formData.projectName,
      projectDescription: formData.projectDescription,
      members: members,
      status: formData.status,
      gitOrg: formData.gitOrg,
      createdByEmail: userEmail,
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : null,
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : null,
    };

    try {
      const response = await fetch(
        "https://proj.zonion.fun/project/create-project",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      onProjectCreated(result);
      onClose();
    } catch (err) {
      console.error("Failed to create project:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-wih-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-wih-700">
        <div className="flex items-center justify-between p-6 border-b border-wih-700">
          <h2 className="text-2xl font-semibold text-wih-50">
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="text-wih-400 hover:text-wih-50 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-wih-50 mb-2 font-medium">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              className="w-full bg-wih-700 text-wih-50 px-4 py-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-wih-50 mb-2 font-medium">
              Project Description
            </label>
            <textarea
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-wih-700 text-wih-50 px-4 py-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none resize-none"
              placeholder="Enter project description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-wih-50 mb-2 font-medium">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full bg-wih-700 text-wih-50 px-4 py-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-wih-50 mb-2 font-medium">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full bg-wih-700 text-wih-50 px-4 py-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-wih-50 mb-2 font-medium">
              Git Organization
            </label>
            <input
              type="text"
              name="gitOrg"
              value={formData.gitOrg}
              onChange={handleInputChange}
              className="w-full bg-wih-700 text-wih-50 px-4 py-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
              placeholder="Enter git organization URL"
            />
          </div>

          <div>
            <label className="block text-wih-50 mb-2 font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full bg-wih-700 text-wih-50 px-4 py-3 rounded-lg border border-wih-600 focus:border-wih-500 focus:outline-none"
            >
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-wih-50 mb-2 font-medium">
              Team Members
            </label>
            <div className="bg-wih-700 rounded-lg border border-wih-600 max-h-64 overflow-y-auto">
              {currentOrg?.members && currentOrg.members.length > 0 ? (
                currentOrg.members.map((member, index) => {
                  const memberKey = member.email;
                  const isSelected = selectedMembers.has(memberKey);
                  const memberRole =
                    formData.members.find((m) => m.memberEmail === member.email)
                      ?.memberRole || "VIEWER";

                  return (
                    <div
                      key={index}
                      className={`px-4 py-3 border-b border-wih-600 last:border-b-0 flex flex-col gap-2 ${
                        isSelected ? "bg-wih-600" : "hover:bg-wih-600"
                      } transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-wih-50">{member.email}</p>
                          <p className="text-wih-400 text-sm">{member.role}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleMemberToggle(member)}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-3 pl-2">
                          <label className="text-wih-400 text-sm">Role:</label>
                          <select
                            value={memberRole}
                            onChange={(e) =>
                              handleRoleChange(member.email, e.target.value)
                            }
                            className="bg-wih-700 border border-wih-600 text-wih-50 px-2 py-1 rounded-md focus:border-wih-500 focus:outline-none"
                          >
                            <option value="MANAGER">Manager</option>
                            <option value="EDITOR">Editor</option>
                            <option value="VIEWER">Viewer</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="px-4 py-3 text-wih-400">No members available</p>
              )}
            </div>

            <p className="text-wih-400 text-sm mt-2">
              Selected: {selectedMembers.size} member(s)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-wih-700 hover:bg-wih-600 text-wih-50 px-6 py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateProjectModal;