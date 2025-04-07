import { z } from "zod";

export const LoginFormSchema = z.object({
  username: z
    .string({
      message: "Please enter your username",
    })
    .min(4, { message: "Username must be 4 characters or longer." }),
  password: z.string().min(1, {
    message: "Please enter your password",
  }),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

export const PasswordChangeSchema = z
  .object({
    password: z
      .string()
      .min(1, {
        message: "Please enter your password",
      })
      .min(7, {
        message: "Password must be at least 7 characters long",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });
export type PasswordChangeData = z.infer<typeof PasswordChangeSchema>;

export const CreateUserSchema = z.object({
  username: z
    .string({
      message: "Please enter a username",
    })
    .min(4, { message: "Username must be 4 characters or longer." }),
  password: z
    .string()
    .min(7, {
      message: "Password must be at least 7 characters long",
    }),
  isAdmin: z.boolean().optional().default(false),
  roleId: z.string().optional(),
  forcePasswordChange: z.boolean().optional().default(true)
});

export type CreateUserData = z.infer<typeof CreateUserSchema>;

export const AdminPasswordResetSchema = z.object({
  userId: z.string({
    required_error: "User ID is required",
  }),
  newPassword: z
    .string()
    .min(7, {
      message: "Password must be at least 7 characters long",
    }),
  forcePasswordChange: z.boolean().default(true)
});

export type AdminPasswordResetData = z.infer<typeof AdminPasswordResetSchema>;
