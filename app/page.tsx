"use client";

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import dynamic from "next/dynamic";

const RailwayMap = dynamic(() => import("./components/RailwayMap"), {
  ssr: false,
});

export default function Page() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google");
    }
  }, [status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    return <RailwayMap />;
  }

  return null;
}


// Use this for auth-free
// "use client";

// import { useEffect } from "react";
// // import { useSession, signIn } from "next-auth/react";
// import dynamic from "next/dynamic";

// const RailwayMap = dynamic(() => import("./components/RailwayMap"), {
//   ssr: false,
// });

// export default function Page() {
//   // const { status } = useSession();

//   /*
//   useEffect(() => {
//     if (status === "unauthenticated") {
//       signIn("google");
//     }
//   }, [status]);
//   */

//   return <RailwayMap />;
// }
