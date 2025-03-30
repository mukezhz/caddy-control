import { z } from "zod";

export const addKeySchema = z.object({
  name: z.string().min(1, "Name is required!"),
});
export type AddKeyValues = z.infer<typeof addKeySchema>;

export const deleteKeySchema = z.object({
  key: z.string().min(1, "Key is required!"),
});
export type DeleteKeyValues = z.infer<typeof deleteKeySchema>;

export type GetKeysResponse = {
  name: string;
  key: string;
  createdAt: string;
};
