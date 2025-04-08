"use client";

import { useAuthStore } from "@/store/authStore";
import { ReactNode } from "react";

interface PermissionGuardProps {
  /**
   * The name of the permission required to render the children
   */
  permission: string;
  /**
   * The content to render if the user has the required permission
   */
  children: ReactNode;
  /**
   * Optional fallback content to render if the user doesn't have permission
   */
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders children based on user permissions
 */
export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission } = useAuthStore();
  
  // Show children if user has the required permission
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  // Otherwise show fallback or null
  return <>{fallback}</>;
}