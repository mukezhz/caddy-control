"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const [checking, setChecking] = useState(true);
    const { accessToken } = useAuthStore();
    const router = useRouter();


    useEffect(() => {
        if (accessToken && !checking) {
            router.replace("/");
        } else {
            setChecking(false);
        }
    }, [accessToken, router, checking]);

    if (checking) return null;

    return (
        <div>{children}</div>
    );
}
