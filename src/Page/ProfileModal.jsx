import React, { useEffect, useState } from "react";
import { AUTH } from "../config/urls.jsx";

const LOCAL_KEY = "userProfile";

export default function ProfileModal({ open, onClose, user, onSave }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // 🧠 Fetch user profile when modal opens
  useEffect(() => {
    if (!open) return;

    // You can store email in localStorage when user logs in
    const userEmail = user?.email || localStorage.getItem("email");
    if (!userEmail) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(AUTH.profile(userEmail),
          {
            method: "GET",
            credentials: "include"
          }
        );
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();

        setUsername(data.username || "");
        setEmail(data.email || "");
        setAvatarUrl(data.profilePictureUrl || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [open]);

  // 🔐 Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // ❌ Don’t render when modal closed
  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  // 💾 Save handler (will connect to backend later)
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        username: username.trim(),
        email,
        avatarUrl: avatarUrl.trim(),
      };
      if (password.trim()) payload.password = password.trim();

      // Local cache
      localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));

      // Optional: also call backend PUT /api/profile/update
      await fetch(AUTH.profileUpdate(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      onSave?.(payload);
      onClose?.();
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="w-full max-w-2xl mx-4 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl ring-1 ring-black/5 overflow-hidden animate-in fade-in zoom-in duration-150"
      >
        <div className="flex items-center justify-between border-b border-neutral-200/70 dark:border-neutral-800 px-4 sm:px-6 py-3">
          <h3 id="profile-modal-title" className="text-lg font-semibold">
            Profile
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 items-center justify-center rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-5">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-800 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                    }}
                  />
                ) : (
                  <span className="text-xs text-neutral-500">No Image</span>
                )}
              </div>
              <div className="w-56">
                <label className="block text-xs text-neutral-500 mb-1">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Info Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Email (view only)
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/70 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  required
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a new password"
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-[11px] text-neutral-500">
                  Demo only; wire to backend to update password.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
