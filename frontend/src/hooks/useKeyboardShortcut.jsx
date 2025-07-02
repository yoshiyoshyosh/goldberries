import { useEffect } from "react";

export function useKeyboardShortcut({ key, shift = false, onKey }) {
  function keyDownHandler(e) {
    if (e.key === key && (!shift || e.shiftKey)) {
      e.preventDefault();
      onKey();
    }
  }
  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);
}
