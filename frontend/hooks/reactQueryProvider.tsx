"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactNode, useEffect, useState } from "react";
import { createQueryClient } from "./reactQuery";

interface ProvidersProps {
  children: ReactNode;
}
declare var window : any;

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());
  useEffect(() => {
    if (typeof window  === "undefined") return;

    const persister = createSyncStoragePersister({
      storage: window.localStorage,
    });

    persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}