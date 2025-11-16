// src/hooks/useFetchOrg.js
import { useState, useEffect } from "react";

import { ORG } from "../config/urls.jsx";
const API_BASE_URL = ORG.base();

export function useFetchOrg(userEmail) {
  const [orgList, setOrgList] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [currentOrgId, setCurrentOrgId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrgs = async () => {
    if (!userEmail) {
      setError("User email not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }


      const data = await response.json();
      console.log("THIS FORM THE UDE" + JSON.stringify(data));
      
      setOrgList(data.orgList || []);
      setCurrentOrg(data.orgList?.[0] || null);
      setCurrentOrgId(data.orgList?.[0]?.orgId || null);

      // Find current user's role
      const currentMember = data.orgList?.[0]?.members?.find(
        (member) => member.email === userEmail
      );
      setCurrentUserRole(currentMember?.role || null);
    } catch (err) {
      console.error("Failed to fetch orgs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [userEmail]);

  return {
    orgList,
    currentOrg,
    setCurrentOrg,
    currentOrgId,
    currentUserRole,
    loading,
    error,
    refreshOrgs: fetchOrgs, // reusable for re-fetching manually
  };
}
