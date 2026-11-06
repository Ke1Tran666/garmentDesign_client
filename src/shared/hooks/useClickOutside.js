import { useEffect } from "react";

/**
 * Custom hook to handle clicks outside of a referenced element.
 * @param {import("react").RefObject} ref - React ref object of target element
 * @param {Function} handler - Callback to execute when clicked outside
 * @param {boolean} [enabled=true] - Whether the listener is active
 */
export const useClickOutside = (ref, handler, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, enabled]);
};

export default useClickOutside;
