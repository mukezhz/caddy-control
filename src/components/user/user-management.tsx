"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useGetRoles, useAssignRole } from "@/hooks/user/roles.hooks";
import { useGetUsers, useGetProfile } from "@/hooks/user/user.hooks";
import { CreateUserDialog } from "./create-user-dialog";
import { AdminResetPasswordDialog } from "./admin-reset-password-dialog";
import { DeleteUserConfirm } from "./delete-user-confirm";
import { User } from "@/schemas/user/user.schema";
import { PlusIcon, MoreHorizontalIcon, KeyIcon, TrashIcon } from "lucide-react";
import { useAuthStore, hasPermission } from "@/store/authStore";
import { Resources } from "@/config/resources";

export default function UserManagement() {
  const { data: userData, isLoading: loadingUsers } = useGetUsers();
  const { data: rolesData, isLoading: loadingRoles } = useGetRoles();
  const { data: currentUser } = useGetProfile();
  const { mutate: assignRole, isPending } = useAssignRole();
  const { user } = useAuthStore();
  
  // Check if user can view settings
  const canView = user?.isAdmin || hasPermission(Resources.WithManage(Resources.USER_MANAGEMENT)) || hasPermission(Resources.WithView(Resources.USER_MANAGEMENT));
  
  // Check if user can modify settings
  const canModify = user?.isAdmin || hasPermission(Resources.WithManage(Resources.USER_MANAGEMENT));
  
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string; roleId?: string | null } | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedFullUser, setSelectedFullUser] = useState<User | null>(null);

  const handleAssignRole = () => {
    if (!selectedUser || !selectedRoleId || !canModify) return;
    
    assignRole(
      {
        userId: selectedUser.id,
        roleId: selectedRoleId
      },
      {
        onSuccess: () => {
          setIsAssignDialogOpen(false);
          setSelectedUser(null);
          setSelectedRoleId("");
        }
      }
    );
  };

  const openAssignDialog = (user: { id: string; username: string; roleId?: string | null }) => {
    if (!canModify) return;
    setSelectedUser(user);
    // Pre-select the user's current role if they have one
    setSelectedRoleId(user.roleId || "");
    setIsAssignDialogOpen(true);
  };

  const openResetPasswordDialog = (user: User) => {
    if (!canModify) return;
    setSelectedFullUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const openDeleteUserDialog = (user: User) => {
    if (!canModify) return;
    setSelectedFullUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  const isCurrentUser = (userId: string) => {
    return currentUser?.id === userId;
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        {canModify && (
          <Button 
            onClick={() => setIsCreateUserDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {loadingUsers ? (
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
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Admin</TableHead>
                {canModify && <TableHead className="w-[200px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {userData?.data?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    {user.role?.name || <span className="text-gray-500">No role</span>}
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </TableCell>
                  {canModify && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openAssignDialog({ 
                            id: user.id, 
                            username: user.username,
                            roleId: user.role?.id
                          })}
                          disabled={user.isAdmin}
                        >
                          {user.role?.id ? "Change Role" : "Assign Role"}
                        </Button>
                        
                        {currentUser?.isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => openResetPasswordDialog(user)}
                                className="cursor-pointer"
                              >
                                <KeyIcon className="mr-2 h-4 w-4" /> 
                                Reset Password
                              </DropdownMenuItem>
                              
                              {!isCurrentUser(user.id) && (
                                <DropdownMenuItem 
                                  onClick={() => openDeleteUserDialog(user)}
                                  className="cursor-pointer text-destructive"
                                >
                                  <TrashIcon className="mr-2 h-4 w-4" /> 
                                  Delete User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!userData?.data?.length && (
                <TableRow>
                  <TableCell colSpan={canModify ? 4 : 3} className="text-center py-4">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {canModify && (
        <>
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedUser?.roleId ? "Change Role" : "Assign Role"}</DialogTitle>
                <DialogDescription>
                  {selectedUser 
                    ? selectedUser.roleId 
                      ? `Change the role for ${selectedUser.username}` 
                      : `Assign a role to ${selectedUser.username}` 
                    : 'Assign a role to a user'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <div className="col-span-3">
                    {loadingRoles ? (
                      <Spinner className="mx-auto" />
                    ) : (
                      <Select
                        value={selectedRoleId}
                        onValueChange={setSelectedRoleId}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {rolesData?.data?.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleAssignRole}
                  disabled={!selectedUser || !selectedRoleId || isPending}
                >
                  {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  {selectedUser?.roleId ? "Update Role" : "Assign Role"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create User Dialog */}
          <CreateUserDialog 
            open={isCreateUserDialogOpen} 
            onOpenChange={setIsCreateUserDialogOpen} 
          />

          {/* Reset Password Dialog */}
          <AdminResetPasswordDialog
            open={isResetPasswordDialogOpen}
            onOpenChange={setIsResetPasswordDialogOpen}
            user={selectedFullUser}
          />

          {/* Delete User Dialog */}
          <DeleteUserConfirm
            open={isDeleteUserDialogOpen}
            onOpenChange={setIsDeleteUserDialogOpen}
            user={selectedFullUser}
          />
        </>
      )}
    </div>
  );
}