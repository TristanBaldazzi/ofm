"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";
import axios from "axios";

const protectedRoutes = ["/dashboard", "/company", "/admin", "/entreprise", "/list", "/user", "/tickets"];

export default function AuthWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (protectedRoutes.some((route) => pathname.startsWith(route))) {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        router.push("/login");
                        return;
                    }
                    await axios.get("http://localhost:5001/api/auth/verify-token", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } catch (error) {
                    localStorage.removeItem("token");
                    router.push("/login");
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [pathname, router]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return <>{children}</>;
}
