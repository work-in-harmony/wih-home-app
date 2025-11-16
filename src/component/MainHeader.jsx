import { Menu } from "lucide-react";
import { AUTH } from "../config/urls.jsx";
import { useEffect, useRef, useState } from "react";

import ProfileModal from "../Page/ProfileModal";

function MainHeader({ setSidebarOpen, orgList, currentOrg, onChangeOrg }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [userEmail, setUserEmail] = useState("");
  const dropdownRef = useRef(null);
  const safeOrgList = Array.isArray(orgList) ? orgList : [];

  const [profileOpen, setProfileOpen] = useState(false);
  const [headerProfile, setHeaderProfile] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userProfile");
      setHeaderProfile(raw ? JSON.parse(raw) : null);
    } catch {
      setHeaderProfile(null);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load user email from localStorage
  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem("email") || "";
      setUserEmail(storedEmail);
    } catch (_) {
      // Ignore if localStorage is unavailable
    }
  }, []);

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    const request = async () => {
      const response = await fetch(AUTH.logout(), {
        method: "POST",
        credentials: "include", // Important: This sends cookies with the request
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.text();
      console.log("Logout Response:", data);
      // naigate("/");
    };
    request();
  };

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
          <h1 className="text-xl font-semibold">
            {(() => {
              const localPart = (userEmail || "").split("@")[0];
              const hour = time.getHours();
              const greeting =
                hour < 12
                  ? "Good morning"
                  : hour < 18
                  ? "Good afternoon"
                  : "Good evening";
              return `${greeting}, ${localPart || "Elu"}`;
            })()}
          </h1>
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

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
            }}
            className="w-10 h-10 bg-wih-600 rounded-full flex items-center justify-center hover:bg-wih-700 transition-colors"
          >
            <span className="text-sm font-semibold">
              {(() => {
                const localPart = (userEmail || "").split("@")[0];
                return (localPart?.charAt(0) || "E").toUpperCase();
              })()}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-wih-700 border border-wih-600 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-2 text-wih-400 text-sm">
                Change Organisation
              </div>
              {safeOrgList.map((org, index) => (
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
              <button
                onClick={() => setProfileOpen(true)}
                className="w-full text-left px-4 py-2 text-white hover:bg-wih-600"
              >
                profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-wih-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={{
          username: headerProfile?.username || "",
          email: headerProfile?.email || "", // replace with your auth email if available
          avatarUrl: headerProfile?.avatarUrl || "",
        }}
        onSave={(updated) => {
          setHeaderProfile((prev) => ({ ...(prev || {}), ...updated }));
        }}
      />
    </header>
  );
}

export default MainHeader;
