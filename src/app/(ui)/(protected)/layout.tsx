"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import TopHeader from "@/components/top-header";
import { useGetProfile } from "@/hooks/user/user.hooks";
import { BoxLoader } from "@/components/loader";
import ChangePassword from "@/components/change-password";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const [checking, setChecking] = useState(true);
    const { accessToken, user, setUser } = useAuthStore();
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
    }, [userData, setUser])

    if (isLoadingProfile) {
        return (
            <BoxLoader />
        )
    }

    if (checking) return null;

    return (
        <div className="h-screen flex flex-col px-48 overflow-hidden">
            <TopHeader />
            <div className="flex-1 px-4 pb-10 max-h-[86vh]">
                {children}
            </div>
            <ChangePassword
                title="Reset your password!"
                description="Please create a new password for your account."
                open={!!user?.forcePasswordChange}
                hideCloseIcon={true}
                onClose={() => { }}
            />
        </div>
    );
}
