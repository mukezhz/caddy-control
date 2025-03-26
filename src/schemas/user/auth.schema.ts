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
