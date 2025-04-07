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
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { Checkbox } from "../ui/checkbox";
import { useCreateUser } from "@/hooks/user/user.hooks";
import { useGetRoles } from "@/hooks/user/roles.hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [forcePasswordChange, setForcePasswordChange] = useState(true);
  
  const { data: rolesData, isLoading: loadingRoles } = useGetRoles();
  const { mutate: createUser, isPending } = useCreateUser();

  const handleSubmit = () => {
    createUser(
      {
        username,
        password,
        isAdmin,
        roleId: roleId || undefined,
        forcePasswordChange,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setUsername("");
          setPassword("");
          setIsAdmin(false);
          setRoleId("");
          setForcePasswordChange(true);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Add a new user to the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
              placeholder="Enter username"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              placeholder="Enter password"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <div className="col-span-3">
              {loadingRoles ? (
                <Spinner className="mx-auto" />
              ) : (
                <Select
                  value={roleId}
                  onValueChange={setRoleId}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role (optional)" />
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

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4 flex items-center space-x-2">
              <Checkbox
                id="isAdmin"
                checked={isAdmin}
                onCheckedChange={(checked) => setIsAdmin(!!checked)}
              />
              <Label htmlFor="isAdmin" className="cursor-pointer">
                Grant admin privileges
              </Label>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4 flex items-center space-x-2">
              <Checkbox
                id="forcePasswordChange"
                checked={forcePasswordChange}
                onCheckedChange={(checked) => setForcePasswordChange(!!checked)}
              />
              <Label htmlFor="forcePasswordChange" className="cursor-pointer">
                Force password change on first login
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
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
            disabled={!username || !password || isPending}
          >
            {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}