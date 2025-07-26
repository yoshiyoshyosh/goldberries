import { useEffect } from "react";

export function useKeyboardShortcut({ key, shift = false, onKey }) {
  function keyDownHandler(e) {
    const typingInInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";
    if (e.key === key && (!shift || e.shiftKey) && !typingInInput && !e.ctrlKey) {
      e.preventDefault();
      onKey();
    }
  }
  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [onKey]);
}
