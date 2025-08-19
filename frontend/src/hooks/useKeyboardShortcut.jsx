import { useEffect } from "react";

export function useKeyboardShortcut({ key, shift = false, onKey, caseSensitive = false }) {
  function keyDownHandler(e) {
    const typingInInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";
    const targetKey = caseSensitive ? e.key : e.key.toLowerCase();
    if (targetKey === key && (!shift || e.shiftKey) && !typingInInput && !e.ctrlKey) {
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
