"use client";

import dynamic from "next/dynamic";

const RailwayMap = dynamic(() => import("./components/RailwayMap"), {
  ssr: false,
});

export default function Page() {
  return <RailwayMap />;
}