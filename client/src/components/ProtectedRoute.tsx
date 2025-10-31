// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import LoadingSkeleton from "./LoadingSkeleton";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuth();
    if (loading) {
        return <LoadingSkeleton />
    }
    if (!user) {
        // Not logged in → redirect to login
        return <Navigate to="/login" replace />;
    }

    return children; // Logged in → render page
}
