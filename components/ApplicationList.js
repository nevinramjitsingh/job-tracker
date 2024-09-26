// components/ApplicationList.js

import { useState, useEffect } from "react";

function ApplicationList() {
  const [applications, setApplications] = useState([]); // Initialize as empty array
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      setApplications([]); // Set applications to an empty array on error
    }
  };

  const filteredApplications = (applications || []).filter((app) => {
    const matchesSearch = app.company
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search by company"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Submitted">Submitted</option>
          <option value="Interview Requested">Interview Requested</option>
          <option value="Assessment Requested">Assessment Requested</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Job Logs Container */}
      <div className="job-logs-container">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app) => (
            <div key={app.id} className="application-item">
              <h3>
                <a href={app.emailLink} target="_blank" rel="noopener noreferrer">
                  {app.position}
                </a>
              </h3>
              <p>Company: {app.company}</p>
              <p>Date Applied: {new Date(app.dateApplied).toLocaleDateString()}</p>
              <p>Status: {app.status}</p>
            </div>
          ))
        ) : (
          <p>No applications found.</p>
        )}
      </div>
    </div>
  );
}

export default ApplicationList;
