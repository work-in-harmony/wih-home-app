import { useState } from "react";
import { IMAGES } from "../config/urls.jsx";
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
} from "lucide-react";

// Logo Component
function Logo() {
  const IMAGE_URL_DARK = IMAGES.LOGO_DARK;
  const IMAGE_URL_LIGHT = IMAGES.LOGO_LIGHT;
  return (
    <img
      src={IMAGE_URL_DARK}
      alt="WorkInHarmony Logo"
      className="w-32 md:w-40"
    />
  );
}

// Reusable Sidebar Component
function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Home", active: true },
    { icon: Building2, label: "Organisation" },
    { icon: Folder, label: "Projects" },
    { icon: CheckSquare, label: "Tasks" },
    { icon: MessageSquare, label: "Team chat" },
    { icon: Search, label: "Search" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-wih-800 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static w-64 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <Logo />
          <button
            onClick={onClose}
            className="lg:hidden text-wih-50 hover:bg-wih-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Collapse Button (Desktop) */}
        <button
          onClick={onClose}
          className="hidden lg:flex absolute -right-3 top-20 bg-wih-700 text-wih-50 rounded-full p-1 hover:bg-wih-600 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                item.active
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

function MainHeader(props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-wih-800 px-4 py-4 lg:px-8 flex items-center justify-between border-b border-wih-700">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => props.setSidebarOpen(true)}
          className="lg:hidden text-wih-50 hover:bg-wih-700 p-2 rounded"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:block">
          <p className="text-sm text-wih-600">Wednesday, September 17</p>
          <h1 className="text-xl font-semibold">Good morning, Mohd</h1>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4 relative">
        <input
          type="text"
          placeholder="Search..."
          className="hidden md:block bg-wih-700 text-wih-50 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-wih-600 w-64"
        />
        <h2 className="text-xl font-semibold hidden lg:block">Company Name</h2>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 bg-wih-600 rounded-full flex items-center justify-center hover:bg-wih-700 transition-colors"
          >
            <span className="text-sm font-semibold">M</span>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-44 bg-wih-700 border border-wih-600 rounded-xl shadow-lg z-50 overflow-hidden animate-fadeIn"
            >
              <button className="w-full text-left px-4 py-2 text-wih-50 hover:bg-wih-600">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-wih-50 hover:bg-wih-600">
                Settings
              </button>
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
// Main Dashboard Component
function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-wih-900 text-wih-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <MainHeader setSidebarOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Company Name - Mobile */}
            <h2 className="text-2xl font-semibold mb-6 lg:hidden text-center">
              Company Name
            </h2>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* My Tasks Section */}
              <div className="bg-wih-800 rounded-lg p-6 border border-wih-700">
                <h3 className="text-xl font-semibold mb-6">My Tasks</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-wih-600 mb-2">Total Tasks</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-wih-600 mb-2">Completed</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-wih-600 mb-2">Overdue</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                </div>
              </div>

              {/* Projects Section */}
              <div className="bg-wih-800 rounded-lg p-6 border border-wih-700">
                <h3 className="text-xl font-semibold mb-6">Projects</h3>
                <div className="space-y-3">
                  <button className="w-full bg-wih-700 hover:bg-wih-600 text-wih-50 px-4 py-3 rounded-lg flex items-center gap-2 transition-colors">
                    <span className="text-xl">+</span>
                    <span>create project</span>
                  </button>
                  <div className="bg-wih-700 px-4 py-3 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 bg-wih-600 rounded"></div>
                    <span>project 1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Content Area */}
            <div className="mt-6 lg:mt-8 bg-wih-800 rounded-lg p-6 border border-wih-700">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <p className="text-wih-600">No recent activity to display</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
