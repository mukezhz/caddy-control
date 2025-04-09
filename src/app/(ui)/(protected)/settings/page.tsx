"use client";

import PageHeader from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetProfile } from "@/hooks/user/user.hooks";
import { hasPermission, useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RolesManagement from "@/components/user/roles";
import PermissionsManagement from "@/components/user/permissions";
import UserManagement from "@/components/user/user-management";
import { Spinner } from "@/components/ui/spinner";
import { BoxLoader } from "@/components/loader";

export default function SettingsPage() {
  const router = useRouter();
  const { accessToken, user, setUser } = useAuthStore();
  const { isLoading } = useGetProfile(!!accessToken);
  const { data: userData, isLoading: isLoadingProfile } = useGetProfile(!!accessToken)
  const hasSettingsAccess = user?.isAdmin || hasPermission('system:manage') || hasPermission('system:view');

  useEffect(() => {
    if (userData) {
      setUser(userData)
    }
  }, [userData, setUser])

  useEffect(() => {
    if (!isLoading && user !== undefined && !hasSettingsAccess) {
      router.push("/");
    }
  }, [isLoading, user, router, hasSettingsAccess]);

  if (isLoadingProfile) {
    return <div className="w-full flex justify-center items-center"><BoxLoader /></div>;
  }

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // Don't render the settings page content if user doesn't have access
  if (!hasSettingsAccess) {
    return (
      <div className="w-full flex justify-center items-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage authorization settings for your application"
      />

      <div className="container mx-auto py-6">
        <Tabs defaultValue="roles">
          <TabsList className="mb-4">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <RolesManagement />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionsManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}