import { useEffect, useState } from "react";

export default function ProjectsTable() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://api.zonion.fun/auth/admin/dashboard/projects", 
      {
        method : "GET",
        credentials : "include"
      }
    )
      .then((res) => res.json())
      .then(setProjects)
      .catch((e) => setError(e.message));
  }, []);

  if (error)
    return (
      <div className="text-red-400 border border-red-600 p-2 rounded">
        {error}
      </div>
    );

  return (
    <div className="rounded-lg border border-wih-700 bg-wih-800/60 p-4">
      <h2 className="text-lg font-semibold mb-4 text-wih-100">
        Project Summary
      </h2>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b border-wih-700 text-wih-400">
            <th className="p-2">Project</th>
            <th className="p-2">Organization</th>
            <th className="p-2 text-center">Members</th>
            <th className="p-2 text-center">Roles</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Timeline</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.projectId} className="border-b border-wih-700">
              <td className="p-2">{p.projectName}</td>
              <td className="p-2">{p.organizationName}</td>
              <td className="p-2 text-center">{p.memberCount}</td>
              <td className="p-2 text-center">
                {Object.entries(p.roleBreakdown || {}).map(([role, count]) => (
                  <div key={role}>
                    <span className="text-wih-300">{role}</span>:{" "}
                    <span className="text-wih-50 font-semibold">{count}</span>
                  </div>
                ))}
              </td>
              <td className="p-2 text-center">{p.status}</td>
              <td className="p-2 text-center">
                {new Date(p.startDate).toLocaleDateString()} -{" "}
                {new Date(p.endDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
