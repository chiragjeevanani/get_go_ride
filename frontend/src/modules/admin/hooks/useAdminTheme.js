import { useState, useEffect } from "react";

export const useAdminTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("admin-theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      console.log("Admin Theme Toggled:", next);
      return next;
    });
  };

  return { theme, toggleTheme };
};
