"use client";

import { createContext, useContext, useMemo, useState } from "react";

const AdminPageContext = createContext(null);

export function AdminPageProvider({ children }) {
  const [title, setTitle] = useState("");
  const value = useMemo(() => ({ title, setTitle }), [title]);
  return (
    <AdminPageContext.Provider value={value}>
      {children}
    </AdminPageContext.Provider>
  );
}

export function useAdminPage() {
  const ctx = useContext(AdminPageContext);
  if (!ctx) {
    throw new Error("useAdminPage must be used within AdminPageProvider");
  }
  return ctx;
}
