"use client";

import { useGetPermissions, useCreatePermission } from "@/hooks/user/roles.hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { Spinner } from "../ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RESOURCES, ResourceAction, Resources, generatePermissionName, getPermissionDescription } from "@/config/resources";
import { Badge } from "../ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthStore, hasPermission } from "@/store/authStore";

export default function PermissionsManagement() {
  const { data: permissionsData, isLoading } = useGetPermissions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { user } = useAuthStore();

  // Check if user has view permissions
  const canView = user?.isAdmin || hasPermission(Resources.WithManage(Resources.USER_MANAGEMENT)) || hasPermission(Resources.WithView(Resources.USER_MANAGEMENT));

  // Check if user can modify settings
  const canModify = user?.isAdmin || hasPermission(Resources.WithManage(Resources.USER_MANAGEMENT));

  const { mutate: createPermission, isPending } = useCreatePermission();

  // Initialize selectedPermissions with existing permissions when dialog opens
  useEffect(() => {
    if (isCreateDialogOpen && permissionsData?.data) {
      // Add existing permission names to selectedPermissions
      const existingNames = permissionsData.data.map(p => p.name);
      setSelectedPermissions(prev => {
        const newSelection = [...prev];
        existingNames.forEach(name => {
          if (!newSelection.includes(name)) {
            newSelection.push(name);
          }
        });
        return newSelection;
      });
    }
  }, [isCreateDialogOpen, permissionsData?.data]);

  const handleCreatePermission = () => {
    // Create all selected permissions that don't already exist
    const existingPermissionNames = new Set(permissionsData?.data?.map(p => p.name) || []);
    const permissionsToCreate = selectedPermissions
      .filter(name => !existingPermissionNames.has(name))
      .map(permId => {
        const [resourceId, action] = permId.split(':');
        return {
          name: permId,
          description: getPermissionDescription(resourceId, action as ResourceAction)
        };
      });

    // Create each permission one by one
    let successCount = 0;
    let failCount = 0;

    const createNext = (index: number) => {
      if (index >= permissionsToCreate.length) {
        if (successCount > 0) {
          toast.success(`Created ${successCount} permissions successfully`);
        }
        if (failCount > 0) {
          toast.error(`Failed to create ${failCount} permissions`);
        }
        setIsCreateDialogOpen(false);
        setSelectedPermissions([]);
        return;
      }

      createPermission(
        permissionsToCreate[index],
        {
          onSuccess: () => {
            successCount++;
            createNext(index + 1);
          },
          onError: () => {
            failCount++;
            createNext(index + 1);
          }
        }
      );
    };

    if (permissionsToCreate.length > 0) {
      createNext(0);
    } else {
      toast.warning("No permissions selected");
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permId)) {
        return prev.filter(id => id !== permId);
      } else {
        return [...prev, permId];
      }
    });
  };

  const handleToggleManage = (resourceId: string, checked: boolean) => {
    const resource = RESOURCES.find(r => r.id === resourceId);
    if (!resource) return;

    resource.availableActions.forEach(action => {
      const permId = generatePermissionName(resourceId, action);
      if (checked) {
        // Add all permissions if not already included
        if (!selectedPermissions.includes(permId)) {
          setSelectedPermissions(prev => [...prev, permId]);
        }
      } else {
        // Remove all permissions
        setSelectedPermissions(prev => prev.filter(id => !id.startsWith(`${resourceId}:`)));
      }
    });
  };

  // Get existing permission names for checking
  const existingPermissionNames = new Set(permissionsData?.data?.map(p => p.name) || []);

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Permission Management</h2>
        {canModify && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>Create Permissions</Button>
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
                <TableHead>Permission Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionsData?.data?.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">{permission.name}</TableCell>
                  <TableCell>{permission.description || "-"}</TableCell>
                </TableRow>
              ))}
              {!permissionsData?.data?.length && (
                <TableRow>
                  <TableCell colSpan={canModify ? 3 : 2} className="text-center py-4">
                    No permissions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {canModify && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Permissions</DialogTitle>
              <DialogDescription>
                Select resources and actions to create permissions for. Each combination will create a separate permission.
              </DialogDescription>
            </DialogHeader>

            <Accordion type="multiple" className="w-full">
              {RESOURCES.map((resource) => {
                const allPermissionsSelected = resource.availableActions.every(action =>
                  selectedPermissions.includes(generatePermissionName(resource.id, action))
                );

                return (
                  <AccordionItem key={resource.id} value={resource.id}>
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2 mr-3 ml-2">
                        <Checkbox
                          id={`resource-${resource.id}`}
                          checked={allPermissionsSelected}
                          onCheckedChange={(checked) => handleToggleManage(resource.id, !!checked)}
                        />
                      </div>
                      <AccordionTrigger className="flex-1 pl-1">
                        <Label htmlFor={`resource-${resource.id}`} className="text-base font-medium cursor-pointer">
                          {resource.name}
                        </Label>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent>
                      <div className="pl-6 space-y-3">
                        <div className="text-sm text-muted-foreground">{resource.description}</div>
                        <div className="space-y-2">
                          {resource.availableActions.map((action) => {
                            const permId = generatePermissionName(resource.id, action);
                            const permDescription = getPermissionDescription(resource.id, action);
                            const alreadyExists = existingPermissionNames.has(permId);

                            return (
                              <div key={permId} className="flex items-center space-x-2">
                                <Checkbox
                                  id={permId}
                                  checked={selectedPermissions.includes(permId)}
                                  onCheckedChange={() => togglePermission(permId)}
                                  disabled={alreadyExists}
                                />
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={permId} className={alreadyExists ? "text-muted-foreground" : ""}>
                                    {permDescription}
                                  </Label>
                                  {alreadyExists && <Badge variant="outline">Exists</Badge>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            <DialogFooter>
              <div className="flex justify-between w-full items-center">
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedPermissions.length} permissions
                </div>
                <Button
                  type="submit"
                  onClick={handleCreatePermission}
                  disabled={selectedPermissions.length === 0 || isPending}
                >
                  {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Create Permissions
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}