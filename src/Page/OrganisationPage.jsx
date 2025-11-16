import { useEffect, useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  CheckSquare,
  Folder,
  MessageSquare,
  Search,
  ChevronLeft,
  Building2,
  UserPlus,
  Mail,
  Shield,
  Users,
  Crown,
  UserCog,
  User,
  Building2Icon,
  LayoutDashboardIcon,
  FolderArchive,
  CheckSquare2,
  MessageSquareCode,
  SearchCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IMAGES, ORG } from "../config/urls.jsx";
import { useFetchOrg } from "../hooks/useFetchOrg";

// Logo Component
function Logo() {
  const IMAGE_URL_DARK = IMAGES.LOGO_DARK;
  return (
    <img
      src={IMAGE_URL_DARK}
      alt="WorkInHarmony Logo"
      className="w-32 md:w-40"
    />
  );
}

// Sidebar Component

function Sidebar({ isOpen, onClose }) {
  const [activeItem, setActiveItem] = useState("Organisation");
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboardIcon, label: "Home", path: "/" },
    { icon: Building2Icon, label: "Organisation", path: "/organisation" },
    { icon: FolderArchive, label: "Projects", path: "/project" },
  ];

  const handleNavigation = (item) => {
    setActiveItem(item.label);
    navigate(item.path);
    onClose(); // close sidebar in mobile view
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-wih-800 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static w-64 flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          <Logo />
          <button
            onClick={onClose}
            className="lg:hidden text-wih-50 hover:bg-wih-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <button
          onClick={onClose}
          className="hidden lg:flex absolute -right-3 top-20 bg-wih-700 text-wih-50 rounded-full p-1 hover:bg-wih-600 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <nav className="flex-1 px-4 py-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                activeItem === item.label
                  ? "bg-wih-700 text-wih-50"
                  : "text-wih-50 hover:bg-wih-700"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}



// Header
function MainHeader({ setSidebarOpen, orgList, currentOrg, onChangeOrg }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-wih-800 px-4 py-4 lg:px-8 flex items-center justify-between border-b border-wih-700">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-wih-50 hover:bg-wih-700 p-2 rounded"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:block">
          <p className="text-sm text-wih-600">
            {time.toLocaleDateString() + " " + time.toLocaleTimeString()}
          </p>
          <h1 className="text-xl font-semibold">Good morning, Elu</h1>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <input
          type="text"
          placeholder="Search..."
          className="hidden md:block bg-wih-700 text-wih-50 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-wih-600 w-64"
        />
        <h2 className="text-xl font-semibold hidden lg:block">
          {currentOrg?.orgName || "Loading..."}
        </h2>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 bg-wih-600 rounded-full flex items-center justify-center hover:bg-wih-700 transition-colors"
          >
            <span className="text-sm font-semibold">E</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-wih-700 border border-wih-600 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-2 text-wih-400 text-sm">
                Change Organisation
              </div>
              {orgList.map((org, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onChangeOrg(org);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 ${
                    currentOrg?.orgName === org.orgName
                      ? "bg-wih-600 text-wih-50"
                      : "text-wih-50 hover:bg-wih-600"
                  }`}
                >
                  {org.orgName}
                </button>
              ))}
              <hr className="border-wih-600" />
              <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-wih-600">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Get role icon and color
function getRoleDetails(role) {
  const roleUpper = role?.toUpperCase();
  switch (roleUpper) {
    case "OWNER":
      return {
        icon: Crown,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
      };
    case "MANAGER":
      return {
        icon: UserCog,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      };
    case "MEMBER":
      return {
        icon: User,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      };
    default:
      return { icon: User, color: "text-wih-400", bgColor: "bg-wih-600" };
  }
}

// Main Dashboard

function OrganisationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({ email: "", role: "MEMBER" });
  const [addingMember, setAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const userEmail = localStorage.getItem("email");
  const navigate = useNavigate();

  // ✅ Using your custom hook
  const {
    orgList,
    currentOrg,
    setCurrentOrg,
    currentOrgId,
    currentUserRole,
    loading,
    error,
    refreshOrgs,
  } = useFetchOrg(userEmail);

  // ✅ Check if current user can manage members
  const canManageMembers = () => {
    return currentUserRole === "OWNER" || currentUserRole === "MANAGER";
  };

  // ✅ Create Organisation handler
  const handleCreateOrganisation = () => {
    navigate("/add-member");
  };

  // ✅ Add Member handler
  const handleAddMember = async () => {
    if (!newMember.email.trim() || !newMember.email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      setAddingMember(true);

      const response = await fetch(ORG.invite(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: currentOrg.orgId,
          ownerEmail: userEmail,
          email: newMember.email,
          role: newMember.role,
        }),
      });

      if (!response.ok) throw new Error("Failed to add member");

      await refreshOrgs(); // ✅ use your hook to refresh list

      setShowAddMemberModal(false);
      setNewMember({ email: "", role: "MEMBER" });
    } catch (err) {
      console.error("Failed to add member:", err);
      alert("Failed to add member. Please try again.");
    } finally {
      setAddingMember(false);
    }
  };

  // ✅ Edit Role handler
  const handleEditRole = (member) => {
    setEditingMember({ ...member });
    setShowEditModal(true);
  };

  // ✅ Update Role handler
  const handleUpdateRole = async () => {
    if (!editingMember) return;

    try {
      const response = await fetch(ORG.updateRole(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentOrg?.orgId,
          email: editingMember.email,
          role: editingMember.role,
        }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      await refreshOrgs(); // ✅ refresh after update

      setShowEditModal(false);
      setEditingMember(null);
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to update role. Please try again.");
    }
  };

  // ✅ Render UI
  return (
    <div className="flex h-screen bg-wih-900 text-wih-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MainHeader
          setSidebarOpen={setSidebarOpen}
          orgList={orgList}
          currentOrg={currentOrg}
          onChangeOrg={(org) => setCurrentOrg(org)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center lg:hidden">
              {currentOrg?.orgName}
            </h2>

            {loading ? (
              <div className="bg-wih-800 p-6 rounded-xl shadow-md text-center">
                <p className="text-wih-400">Loading organisations...</p>
              </div>
            ) : error ? (
              <div className="bg-wih-800 p-6 rounded-xl shadow-md text-center">
                <p className="text-red-400">Error: {error}</p>
              </div>
            ) : orgList.length === 0 ? (
              <div className="bg-wih-800 p-6 rounded-xl shadow-md text-center">
                <p className="text-wih-400 mb-4">
                  You don't have any organisations yet.
                </p>
                <button
                  onClick={handleCreateOrganisation}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Create Organisation
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ✅ Team Members Section */}
                <div className="bg-wih-800 p-6 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-blue-500" />
                      <h3 className="text-xl font-semibold">Team Members</h3>
                      <span className="text-sm text-wih-400">
                        ({currentOrg?.members?.length || 0} members)
                      </span>
                    </div>
                  </div>

                  {currentOrg?.members?.length > 0 ? (
                    <div className="grid gap-3">
                      {currentOrg.members.map((member, index) => {
                        const roleDetails = getRoleDetails(member.role);
                        const RoleIcon = roleDetails.icon;
                        const isCurrentUser = member.email === userEmail;

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-wih-700 px-5 py-4 rounded-lg hover:bg-wih-600 transition group"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold">
                                  {member.email?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-wih-400 flex-shrink-0" />
                                  <span className="truncate">{member.email}</span>
                                  {isCurrentUser && (
                                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                              <div className="flex items-center gap-2">
                                <RoleIcon className={`w-4 h-4 ${roleDetails.color}`} />
                                <span
                                  className={`text-sm px-3 py-1 rounded-full capitalize ${roleDetails.bgColor} ${roleDetails.color}`}
                                >
                                  {member.role}
                                </span>
                              </div>
                              {canManageMembers() && !isCurrentUser && (
                                <button
                                  onClick={() => handleEditRole(member)}
                                  className="px-3 py-1 text-sm bg-wih-600 hover:bg-wih-700 rounded-lg transition"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-wih-600 mx-auto mb-4" />
                      <p className="text-wih-400 mb-4">No team members found.</p>
                    </div>
                  )}
                </div>

                {/* ✅ Add Member Section */}
                {canManageMembers() && (
                  <div className="bg-wih-800 p-6 rounded-xl shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <UserPlus className="w-6 h-6 text-green-500" />
                      <h3 className="text-xl font-semibold">Add New Member</h3>
                    </div>
                    <p className="text-wih-400 mb-6">
                      Invite a new team member to join your organisation
                    </p>
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Add Team Member</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ✅ Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-wih-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-wih-700">
              <h3 className="text-xl font-semibold">Add Team Member</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-2 hover:bg-wih-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                  placeholder="member@example.com"
                  className="w-full px-4 py-2 bg-wih-700 border border-wih-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-wih-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) =>
                    setNewMember({ ...newMember, role: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-wih-700 border border-wih-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-wih-50"
                >
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-wih-700">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="flex-1 px-4 py-2 bg-wih-700 hover:bg-wih-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={addingMember}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition"
              >
                {addingMember ? "Adding..." : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit Role Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-wih-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-wih-700">
              <h3 className="text-xl font-semibold">Edit Member Role</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMember(null);
                }}
                className="p-2 hover:bg-wih-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={editingMember.email}
                  disabled
                  className="w-full px-4 py-2 bg-wih-600 border border-wih-600 rounded-lg text-wih-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={editingMember.role}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, role: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-wih-700 border border-wih-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-wih-50"
                >
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-wih-700">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMember(null);
                }}
                className="flex-1 px-4 py-2 bg-wih-700 hover:bg-wih-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganisationPage;

