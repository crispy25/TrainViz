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
          fontSize: "24px",
        }}
      >
        <img
          src="/TrainVisualizerLogo.png"
          alt="TrainViz logo"
          style={{
            width: 360,
            height: 360,
            objectFit: "contain",
            marginBottom: -80,
          }}
        />


        <button
         style={{
            border: "2px groove",
            borderRadius: 16,
            padding: "10px 24px",
            cursor: "pointer",
          }}
          onClick={() => {
            localStorage.setItem("authMode", "google");
            setAuthMode("google");
          }}
        >
          Login with Google
        </button>

        <button
          style={{
            border: "2px groove",
            borderRadius: 16,
            padding: "10px 24px",
            cursor: "pointer",
          }}
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
