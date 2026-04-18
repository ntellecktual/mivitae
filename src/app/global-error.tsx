"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: "48px", textAlign: "center", fontFamily: "system-ui" }}>
          <h2>Something went wrong</h2>
          <p style={{ color: "#666", marginTop: 8 }}>
            The error has been reported automatically.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "10px 24px",
              borderRadius: 8,
              border: "1px solid #ddd",
              cursor: "pointer",
              background: "#111",
              color: "#fff",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
