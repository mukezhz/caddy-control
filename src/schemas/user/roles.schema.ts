import { z } from "zod";

// Permission schemas
export const CreatePermissionSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Permission name must be at least 3 characters" }),
  description: z.string().optional(),
});

export const UpdatePermissionSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(3, { message: "Permission name must be at least 3 characters" }),
  description: z.string().optional(),
});

// Role schemas
export const CreateRoleSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Role name must be at least 3 characters" }),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export const UpdateRoleSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(3, { message: "Role name must be at least 3 characters" }),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export const AssignRoleSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  roleId: z.string().min(1, { message: "Role ID is required" }),
});

// Types
export type CreatePermissionData = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionData = z.infer<typeof UpdatePermissionSchema>;
export type CreateRoleData = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleData = z.infer<typeof UpdateRoleSchema>;
export type AssignRoleData = z.infer<typeof AssignRoleSchema>;
