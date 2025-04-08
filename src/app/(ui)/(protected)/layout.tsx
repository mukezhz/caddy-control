"use client";

import { useAuthStore } from "@/store/authStore";
import TopHeader from "@/components/top-header";
import ChangePassword from "@/components/user/change-password";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();

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
