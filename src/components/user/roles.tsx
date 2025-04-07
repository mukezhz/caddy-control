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

export default function RolesManagement() {
  const { data: rolesData, isLoading } = useGetRoles();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Role Management</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Create Role</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Spinner />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
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
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditRole(role)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!rolesData?.data?.length && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No roles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateRoleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      <EditRoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        role={selectedRole}
      />
    </div>
  );
}