"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";


export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const [checking, setChecking] = useState(true);
    const { user, accessToken } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!user || !accessToken) {
            router.replace("/login");
        } else {
            setChecking(false);
        }
    }, [user, router]);

    if (checking) return null;


    return (
        <div>
            {children}
        </div>
    );
}
