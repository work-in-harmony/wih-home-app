import { useState } from "react";
import {
  Users,
  Plus,
  X,
  Mail,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Target,
  TrendingUp,
  Building2,
} from "lucide-react";
import Logo from "../component/Logo1";
import { useNavigate } from "react-router-dom";

export default function TeamInvite() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([
    { id: 1, email: "", role: "member" },
    { id: 2, email: "", role: "member" },
  ]);
  const [openDropdown, setOpenDropdown] = useState(null);

  // 🔹 New States
  const [organizationName, setOrganizationName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState(""); // assuming the creator adds their email

  const roles = [
    { value: "MEMBER", label: "Member" },
    { value: "MANAGER", label: "Manager" },
  ];

  const addMember = () => {
    setMembers([...members, { id: Date.now(), email: "", role: "member" }]);
  };

  const removeMember = (id) => {
    if (members.length > 1) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  const updateEmail = (id, email) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, email } : m)));
  };

  const updateRole = (id, role) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, role } : m)));
    setOpenDropdown(null);
  };

  // 🔹 Send data to backend
  // 🔹 Send data to backend
  const handleInvite = async () => {
    if (!organizationName.trim()) {
      alert("Please enter organization name");
      return;
    }

    if (!ownerEmail.trim()) {
      alert("Please enter owner email");
      return;
    }

    // Map members to match TeamMembers structure with email and role
    const teamMembersEmail = members
      .filter((m) => m.email.trim() !== "")
      .map((m) => ({
        email: m.email,
        role: m.role.toUpperCase(), // Convert to uppercase to match RoleType enum
      }));

    const numberOfMembers = teamMembersEmail.length;
    
    const planTypeLocal = localStorage.getItem("planType") || "BASIC";

    const requestBody = {
      organizationName,
      ownerEmail,
      teamMembersEmail,
      numberOfMembers,
      planType: planTypeLocal, // Add default plan type or make it dynamic
    };

    try {
      const response = await fetch(
        ORG.create(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create organization");
      }

      const data = await response.json();
      alert(`✅ ${data.message || "Organization created successfully!"}`);
      console.log("Server Response:", data);
      navigate("/dashboard");
      } catch (error) {
        console.error("Error creating organization:", error);
        alert("❌ Failed to create organization. Please try again.");
      }
    };

  return (
    <div className="min-h-screen bg-wih-900 flex">
      {/* Left Side */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-xl">
          <Logo />

          {/* Organization Name */}
          <h1 className="text-3xl font-bold text-wih-50 mb-8">
            Add Organization Name
          </h1>
          <div className="relative flex-1 mb-8 max-w-md">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wih-600" />
            <input
              type="text"
              placeholder="Organization Name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full bg-wih-800 border border-wih-700 rounded-lg pl-10 pr-4 py-3 text-wih-50 placeholder:text-wih-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Owner Email */}
          <div className="relative flex-1 mb-8 max-w-md">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wih-600" />
            <input
              type="email"
              placeholder="Owner Email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full bg-wih-800 border border-wih-700 rounded-lg pl-10 pr-4 py-3 text-wih-50 placeholder:text-wih-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Team Members */}
          <h1 className="text-3xl font-bold text-wih-50 mb-8">
            Who else is on your team?
          </h1>

          <div className="space-y-3 mb-6">
            {members.map((member) => (
              <div key={member.id} className="flex gap-3 group">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wih-600" />
                  <input
                    type="email"
                    placeholder="Add Email"
                    value={member.email}
                    onChange={(e) => updateEmail(member.id, e.target.value)}
                    className="w-full bg-wih-800 border border-wih-700 rounded-lg pl-10 pr-4 py-3 text-wih-50 placeholder:text-wih-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Role Dropdown */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === member.id ? null : member.id
                      )
                    }
                    className="bg-wih-800 border border-wih-700 rounded-lg px-4 py-3 text-wih-50 flex items-center gap-2 hover:border-wih-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-w-[120px] justify-between"
                  >
                    <span className="capitalize">{member.role}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {openDropdown === member.id && (
                    <div className="absolute top-full mt-2 w-full bg-wih-800 border border-wih-700 rounded-lg shadow-xl z-10 overflow-hidden">
                      {roles.map((role) => (
                        <button
                          key={role.value}
                          onClick={() => updateRole(member.id, role.value)}
                          className="w-full text-left px-4 py-2.5 text-wih-50 hover:bg-wih-700 transition-colors"
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="opacity-0 group-hover:opacity-100 bg-wih-800 border border-wih-700 rounded-lg px-3 hover:border-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <X className="w-4 h-4 text-wih-600 hover:text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Another */}
          <button
            onClick={addMember}
            className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1 mb-12 transition-colors"
          >
            <Plus className="w-4 h-4" />
            add another person
          </button>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button className="text-wih-600 hover:text-wih-50 font-medium transition-colors">
              Skip
            </button>
            <button
              onClick={handleInvite}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/20"
            >
              Invite to your team
            </button>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex w-1/3 bg-gradient-to-br from-wih-800 to-wih-900 items-center justify-center p-16 relative overflow-hidden">
        {/* ... keep your right-side content unchanged */}
        <div className="absolute inset-0 opacity-5">
          {" "}
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-wih-50 rounded-lg rotate-12"></div>{" "}
          <div className="absolute bottom-20 right-20 w-40 h-40 border-2 border-wih-50 rounded-lg -rotate-6"></div>{" "}
          <div className="absolute top-1/2 left-20 w-24 h-24 border-2 border-wih-50 rounded-full"></div>{" "}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
          {" "}
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 tracking-wide">
            {" "}
            Team work is dream work{" "}
          </h2>{" "}
          <p className="text-white text-lg italic">
            {" "}
            Together, we turn ideas into reality.{" "}
          </p>{" "}
        </div>
        <style>
          {`
            @keyframes glow {
              0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.4); }
              50% { box-shadow: 0 0 40px rgba(168,85,247,0.6); }
            }
            .animate-glow {
              animation: glow 3s ease-in-out infinite;
            }
          `}
        </style>
        <div className="absolute top-20 right-20 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>{" "}
        <div className="absolute bottom-40 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>
    </div>
  );
}
import { ORG } from "../config/urls.jsx";
