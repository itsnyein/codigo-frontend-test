import { Toaster } from "sonner";
import { StoreProvider } from "@/store/StoreProvider";

export default function WorkspaceLayout({ children }: LayoutProps<"/">) {
  return (
    <StoreProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </StoreProvider>
  );
}
