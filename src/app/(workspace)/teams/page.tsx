import { WorkspaceGuard } from "@/features/auth/WorkspaceGuard";

export default function TeamsPage() {
  return <WorkspaceGuard />;
}
