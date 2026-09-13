import type { ReactNode } from "react";
import { StoreProvider } from "@/store/StoreProvider";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
