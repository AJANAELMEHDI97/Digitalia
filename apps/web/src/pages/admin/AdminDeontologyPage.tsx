import { Navigate } from "react-router-dom";

export default function AdminDeontologyPage() {
  return <Navigate to="/admin/compliance?tab=deontology" replace />;
}
