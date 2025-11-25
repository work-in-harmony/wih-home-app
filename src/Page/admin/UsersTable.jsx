import { useEffect, useState } from "react";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (pageNum = 0) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.zonion.fun/auth/admin/dashboard/users?page=${pageNum}&size=10`, {
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data.content || []);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId) => {
    try {
      await fetch(`https://api.zonion.fun/auth/admin/dashboard/users/${userId}/toggle-block`, {
        method: "PUT",
        credentials: "include",
      });
      fetchUsers(page);
    } catch (err) {
      console.error("Failed to toggle block", err);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  return (
    <div className="rounded-md border border-wih-700 bg-wih-800/60 p-4">
      <h2 className="text-lg font-semibold text-wih-50 mb-4">Users</h2>
      {loading ? (
        <div className="text-wih-400 text-sm">Loading...</div>
      ) : (
        <table className="w-full text-sm text-wih-300">
          <thead>
            <tr className="border-b border-wih-700 text-wih-400">
              <th className="py-2 text-left">Email</th>
              <th className="py-2 text-left">Username</th>
              <th className="py-2 text-left">Role</th>
              <th className="py-2 text-left">Blocked</th>
              <th className="py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-center text-wih-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.userId} className="border-b border-wih-700/40 hover:bg-wih-700/40">
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{user.username}</td>
                  <td className="py-2">{user.roleUser}</td>
                  <td className="py-2">{user.blocked ? "Yes" : "No"}</td>
                  <td className="py-2 text-center">
                    <button
                      onClick={() => toggleBlock(user.userId)}
                      className={`rounded px-3 py-1 text-sm font-semibold ${
                        user.blocked
                          ? "bg-emerald-600 hover:bg-emerald-500"
                          : "bg-red-600 hover:bg-red-500"
                      } text-wih-50`}
                    >
                      {user.blocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-wih-400">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          className="px-3 py-1 bg-wih-700 rounded disabled:opacity-40"
        >
          Prev
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          className="px-3 py-1 bg-wih-700 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
