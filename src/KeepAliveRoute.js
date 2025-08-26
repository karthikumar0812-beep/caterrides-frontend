import { useRef } from "react";

/**
 * Wraps a route element and keeps it mounted until browser refresh.
 */
export default function KeepAliveRoute({ element }) {
  const ref = useRef(null);

  if (!ref.current) {
    ref.current = element; // cache the first time
  }

  return ref.current;
}
