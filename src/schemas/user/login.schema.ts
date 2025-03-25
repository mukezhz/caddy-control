import { z } from "zod";

export const LoginFormSchema = z.object({
  username: z
    .string({
      message: "Please enter your username",
    })
    .min(4, { message: "Username must be 4 characters or longer." }),
  password: z
    .string()
    .min(1, {
      message: "Please enter your password",
    })
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;
