"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateRole } from "@/hooks/user/roles.hooks";
import { useGetPermissions } from "@/hooks/user/roles.hooks";
import { useEffect, useState, useMemo } from "react";
import { Checkbox } from "../ui/checkbox";
import { Spinner } from "../ui/spinner";
import { Role, Permission } from "@/schemas/user/user.schema";
import { ScrollArea } from "../ui/scroll-area";

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

// Helper function to extract group name from permission name
const getPermissionGroup = (name: string): string => {
  // If name contains a colon, split by it and take the first part as the group
  if (name.includes(':')) {
    return name.split(':')[0];
  }
  
  // Try to match common resource patterns
  if (name.startsWith('create') || name.startsWith('read') || 
      name.startsWith('update') || name.startsWith('delete')) {
    const action = name.match(/^(create|read|update|delete)/i)?.[0] || '';
    const resource = name.slice(action.length);
    if (resource) {
      return resource.charAt(0).toUpperCase() + resource.slice(1);
    }
  }
  
  // If no pattern is detected, return 'Other'
  return 'Other';
};

export function EditRoleDialog({ open, onOpenChange, role }: EditRoleDialogProps) {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  const { data: permissionsData, isLoading: loadingPermissions } = useGetPermissions();
  const { mutate: updateRole, isPending } = useUpdateRole();

  // Populate the form with role data when it changes
  useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setDescription(role.description || "");
      setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    }
  }, [role]);

  // Group permissions by their names
  const groupedPermissions = useMemo(() => {
    if (!permissionsData?.data) return {};
    
    const groups: Record<string, Permission[]> = {};
    
    permissionsData.data.forEach((permission) => {
      const group = getPermissionGroup(permission.name);
      
      if (!groups[group]) {
        groups[group] = [];
      }
      
      groups[group].push(permission);
    });
    
    // Initialize expanded state for all groups
    if (Object.keys(expandedGroups).length === 0) {
      const newExpandedGroups: Record<string, boolean> = {};
      Object.keys(groups).forEach(group => {
        newExpandedGroups[group] = true; // Default to expanded
      });
      setExpandedGroups(newExpandedGroups);
    }
    
    return groups;
  }, [permissionsData?.data, expandedGroups]);

  const handleSubmit = () => {
    if (!role?.id) return;
    
    updateRole(
      {
        id: role.id,
        name: roleName,
        description,
        permissions: selectedPermissions,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Check if all permissions in a group are selected
  const isGroupFullySelected = (permissions: Permission[]) => {
    return permissions.every(permission => selectedPermissions.includes(permission.id));
  };

  // Check if some (but not all) permissions in a group are selected
  const isGroupPartiallySelected = (permissions: Permission[]) => {
    return permissions.some(permission => selectedPermissions.includes(permission.id)) && 
           !isGroupFullySelected(permissions);
  };

  // Toggle all permissions in a group
  const toggleGroupPermissions = (permissions: Permission[]) => {
    const isFullySelected = isGroupFullySelected(permissions);
    
    if (isFullySelected) {
      // Unselect all permissions in the group
      setSelectedPermissions(prev => 
        prev.filter(id => !permissions.some(p => p.id === id))
      );
    } else {
      // Select all permissions in the group
      const permissionIds = permissions.map(p => p.id);
      setSelectedPermissions(prev => {
        const currentIds = new Set(prev);
        permissionIds.forEach(id => currentIds.add(id));
        return Array.from(currentIds);
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update the role details and permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 flex-1 overflow-hidden">
          <div className="grid gap-4">
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="col-span-4"
                placeholder="Enter role name"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-4"
                placeholder="Enter role description (optional)"
              />
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-1">Permissions</h3>
              <p className="text-xs text-muted-foreground">
                Select the permissions you want to assign to this role
              </p>
            </div>
            
            {loadingPermissions ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : (
              <ScrollArea className="h-[280px] rounded-md border p-2">
                <div className="space-y-1">
                  {Object.entries(groupedPermissions).map(([group, permissions]) => (
                    <div key={group} className="border rounded-md mb-2 overflow-hidden">
                      <div 
                        className="flex items-center bg-slate-50 dark:bg-slate-800 p-3 cursor-pointer"
                        onClick={() => toggleGroup(group)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            id={`group-edit-${group}`}
                            checked={isGroupFullySelected(permissions)}
                            indeterminate={isGroupPartiallySelected(permissions)}
                            onCheckedChange={() => toggleGroupPermissions(permissions)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Label 
                            htmlFor={`group-edit-${group}`}
                            className="font-medium text-sm cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGroupPermissions(permissions);
                            }}
                          >
                            {group}
                          </Label>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {expandedGroups[group] ? '▼' : '►'} 
                        </div>
                      </div>
                      
                      {expandedGroups[group] && (
                        <div className="p-2 border-t">
                          <div className="space-y-2 pl-8">
                            {permissions.map((permission) => (
                              <div key={permission.id} className="flex items-start gap-3">
                                <Checkbox
                                  id={`permission-edit-${permission.id}`}
                                  checked={selectedPermissions.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                  className="mt-1"
                                />
                                <div>
                                  <Label 
                                    htmlFor={`permission-edit-${permission.id}`}
                                    className="font-medium text-sm"
                                  >
                                    {permission.name}
                                  </Label>
                                  {permission.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {!permissionsData?.data?.length && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No permissions available
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!roleName || isPending}
          >
            {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}