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
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { Checkbox } from "../ui/checkbox";
import { useAdminResetPassword } from "@/hooks/user/user.hooks";
import { PasswordInput } from "../password-input";
import { User } from "@/schemas/user/user.schema";

interface AdminResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function AdminResetPasswordDialog({ 
  open, 
  onOpenChange,
  user 
}: AdminResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [forcePasswordChange, setForcePasswordChange] = useState(true);
  
  const { mutate: resetPassword, isPending } = useAdminResetPassword();

  const handleSubmit = () => {
    if (!user?.id || !newPassword) return;
    
    resetPassword(
      {
        userId: user.id,
        newPassword,
        forcePasswordChange,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setNewPassword("");
          setForcePasswordChange(true);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset User Password</DialogTitle>
          <DialogDescription>
            {user ? `Reset password for ${user.username}` : 'Reset user password'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-password" className="text-right">
              New Password
            </Label>
            <div className="col-span-3">
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4 flex items-center space-x-2">
              <Checkbox
                id="force-password-change"
                checked={forcePasswordChange}
                onCheckedChange={(checked) => setForcePasswordChange(!!checked)}
              />
              <Label htmlFor="force-password-change" className="cursor-pointer">
                Require password change on next login
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
            disabled={!user?.id || !newPassword || isPending}
          >
            {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}