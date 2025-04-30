"use client";

import { Role } from "@/schemas/user/user.schema";
import { useGetRoles } from "@/hooks/user/roles.hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useState } from "react";
import { CreateRoleDialog } from "@/components/user/create-role-dialog";
import { EditRoleDialog } from "@/components/user/edit-role-dialog";
import { Spinner } from "../ui/spinner";
import { useAuthStore, hasPermission } from "@/store/authStore";
import { Resources } from "@/config/resources";

export default function RolesManagement() {
  const { data: rolesData, isLoading } = useGetRoles();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { user } = useAuthStore();
  
  // Check if user has view permissions
  const canView = user?.isAdmin || hasPermission(Resources.WithManage(Resources.USER_MANAGEMENT)) || hasPermission(Resources.WithView(Resources.USER_MANAGEMENT));
  
  // Check if user can modify settings
  const canModify = user?.isAdmin || hasPermission(Resources.WithManage(Resources.USER_MANAGEMENT));

  const handleEditRole = (role: Role) => {
    if (!canModify) return;
    setSelectedRole(role);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Role Management</h2>
        {canModify && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>Create Role</Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Spinner />
        </div>
      ) : !canView ? (
        <div className="text-center py-4">
          You don't have permission to view this content
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                {canModify && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesData?.data?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions?.map((permission) => (
                        <Badge key={permission.id} variant="secondary">
                          {permission.name}
                        </Badge>
                      ))}
                      {!role.permissions?.length && (
                        <span className="text-gray-500">No permissions</span>
                      )}
                    </div>
                  </TableCell>
                  {canModify && (
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditRole(role)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!rolesData?.data?.length && (
                <TableRow>
                  <TableCell colSpan={canModify ? 4 : 3} className="text-center py-4">
                    No roles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {canModify && (
        <>
          <CreateRoleDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          />
          
          <EditRoleDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            role={selectedRole}
          />
        </>
      )}
    </div>
  );
}