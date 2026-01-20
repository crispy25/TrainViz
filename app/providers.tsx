'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
	return <SessionProvider>{children}</SessionProvider>;
}


// use this for auth-free
// 'use client';

// export function Providers({ children }: { children: React.ReactNode }) {
//   return <>{children}</>;
// }
