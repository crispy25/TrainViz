"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import dynamic from "next/dynamic";

const RailwayMap = dynamic(() => import("./components/RailwayMap"), {
  ssr: false,
});

type AuthMode = "google" | "guest" | null | undefined;

export default function Page() {
  const { status } = useSession();
  const [authMode, setAuthMode] = useState<AuthMode>(undefined);

  useEffect(() => {
    const mode = localStorage.getItem("authMode") as AuthMode;
    setAuthMode(mode);
  }, []);

  useEffect(() => {
    if (authMode === "google" && status === "unauthenticated") {
      signIn("google");
    }
  }, [authMode, status]);

  if (authMode === undefined || status === "loading") {
    return <div>Loading...</div>;
  }

  if (authMode === null) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <h1 style={{ fontSize: "48px" }}>🚆 TrainVisualizer</h1>

        <button
          onClick={() => {
            localStorage.setItem("authMode", "google");
            setAuthMode("google");
          }}
        >
          Login with Google
        </button>

        <button
          onClick={() => {
            localStorage.setItem("authMode", "guest");
            setAuthMode("guest");
          }}
        >
          Continue as Guest
        </button>
      </div>
    );
  }

  if (authMode === "guest") {
    return <RailwayMap />;
  }

  if (authMode === "google" && status === "authenticated") {
    return <RailwayMap />;
  }

  return null;
}
