import React, { useState } from "react";

export const SkipNavigation = () => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <a
      className={`${
        isFocused ? "" : "sr-only"
      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      href="#main-page-content"
    >
      Skip Navigation
    </a>
  );
};
