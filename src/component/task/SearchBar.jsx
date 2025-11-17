import { useState, useRef, useEffect } from "react";

export default function SearchBar({
  projectId,
  onSelectTask, // callback to open task sidebar
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!searchKeyword.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://proj.zonion.fun/tasks/search?keyword=${searchKeyword}&projectId=${projectId}`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 400);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchKeyword, projectId]);

  return (
    <div className="relative w-64">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        className="px-3 py-1.5 bg-wih-800 border border-wih-700 rounded-lg text-sm w-full
                   focus:outline-none focus:ring-2 focus:ring-wih-500"
        autoComplete="off"
      />

      {/* Dropdown results */}
      {searchKeyword.trim() !== "" && searchResults.length > 0 && (
        <div
          className="absolute mt-1 bg-wih-800 border border-wih-700 rounded-lg w-full shadow-xl 
                     z-50 max-h-72 overflow-y-auto"
        >
          {searchResults.map((task) => (
            <div
              key={task.id}
              className="p-3 cursor-pointer hover:bg-wih-700 transition-colors"
              onClick={() => {
                onSelectTask(task);
                setSearchKeyword("");
                setSearchResults([]);
              }}
            >
              <div className="flex items-start justify-between w-full">
                <div className="font-medium text-wih-50">
                  {task.title}
                </div>

                {/* Priority Badge */}
                <div
                  className={`text-xs font-semibold inline-block px-2 py-0.5 rounded-md ml-2
      ${task.priority === "HIGH"
                      ? "bg-red-600/20 text-red-400"
                      : task.priority === "MEDIUM"
                        ? "bg-yellow-600/20 text-yellow-400"
                        : "bg-green-600/20 text-green-400"
                    }
    `}
                >
                  {task.priority}
                </div>
              </div>

              <div className="text-xs font-light text-wih-300 line-clamp-2">
                {task.description || "No description"}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
