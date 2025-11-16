import { Building2Icon, CheckSquare2, ChevronLeft, FolderArchive, LayoutDashboardIcon, MessageSquareCode, SearchCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const locations = useLocation();

  const menuItems = [
    { icon: LayoutDashboardIcon, label: "Home", path: "/" },
    { icon: Building2Icon, label: "Organisation", path: "/organisation" },
    { icon: FolderArchive, label: "Projects", path: "/project" },
  ];

    // 🔹 Load the active item from localStorage (or default to "Home")
  const [activeItem, setActiveItem] = useState(
    localStorage.getItem("activeSidebarItem") || "Home"
  );

  // 🔹 Watch for route changes and update activeItem accordingly
  useEffect(() => {
    const currentItem = menuItems.find((item) =>
      location.pathname.startsWith(item.path)
    );
    if (currentItem) {
      setActiveItem(currentItem.label);
      localStorage.setItem("activeSidebarItem", currentItem.label); // keep in sync
    }
  }, [location.pathname]);

  // 🔹 When user clicks a menu item
  const handleNavigation = (item) => {
    setActiveItem(item.label);
    localStorage.setItem("activeSidebarItem", item.label);
    navigate(item.path);
    onClose(); // close for mobile view
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
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

export default Sidebar;