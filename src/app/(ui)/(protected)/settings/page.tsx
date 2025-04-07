"use client";

import PageHeader from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetProfile } from "@/hooks/user/user.hooks";
import { hasPermission, useAuthStore } from "@/store/authStore";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import RolesManagement from "@/components/user/roles";
import PermissionsManagement from "@/components/user/permissions";
import UserManagement from "@/components/user/user-management";
import { Spinner } from "@/components/ui/spinner";

export default function SettingsPage() {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const { data: profileData, isLoading } = useGetProfile(!!accessToken);

  // Check if user has access to settings (admin or has system:manage permission)
  const hasSettingsAccess = user?.isAdmin || hasPermission('system:manage');

  const checkAuth = useCallback(() => {
    if (!accessToken) {
      router.push("/login");
    }
  }, [accessToken, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (profileData?.forcePasswordChange) {
      router.push("/change-password");
    }
  }, [profileData, router]);

  // Check for settings access in a useEffect hook instead of during render
  useEffect(() => {
    // Only redirect if we've loaded the user data and the user doesn't have access
    if (!isLoading && user !== undefined && !hasSettingsAccess) {
      router.push("/");
    }
  }, [isLoading, user, router, hasSettingsAccess]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // Don't render the settings page content if user doesn't have access
  if (!hasSettingsAccess) {
    return (
      <div className="flex justify-center items-center h-screen">
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