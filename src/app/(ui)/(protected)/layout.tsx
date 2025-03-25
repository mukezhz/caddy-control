"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import TopHeader from "@/components/top-header";
import { useGetProfile } from "@/hooks/user/user.hooks";
import { BoxLoader } from "@/components/loader";


export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const [checking, setChecking] = useState(true);
    const { accessToken, setUser } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!accessToken) {
            router.replace("/login");
        } else {
            setChecking(false);
        }
    }, [accessToken, router]);

    const { data: userData, isLoading: isLoadingProfile } = useGetProfile(!!accessToken)

    useEffect(() => {
        if (userData) {
            setUser(userData)
        }
    }, [userData])

    if (isLoadingProfile) {
        return (
            <BoxLoader />
        )
    }

    if (checking) return null;

    return (
        <div className="px-32">
            <TopHeader />
            {children}
        </div>
    );
}
