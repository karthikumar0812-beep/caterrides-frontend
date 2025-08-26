import { useLocation, matchPath } from "react-router-dom";
import { useRef } from "react";

/**
 * Keeps all visited routes mounted in memory.
 * Shows only the current one.
 */
export default function KeepAliveSwitch({ routes }) {
  const location = useLocation();
  const cache = useRef({});

  // Find the matching route definition
  const matchedRoute = routes.find(r =>
    matchPath(r.path, location.pathname)
  );

  // Cache it if not already
  if (matchedRoute && !cache.current[location.pathname]) {
    cache.current[location.pathname] = matchedRoute.element;
  }

  return (
    <>
      {Object.entries(cache.current).map(([path, element]) => (
        <div
          key={path}
          style={{
            display: matchPath(path, location.pathname) ? "block" : "none",
          }}
        >
          {element}
        </div>
      ))}
    </>
  );
}
