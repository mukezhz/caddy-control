import { handleServerError } from "@/lib/handle-server-error";
import { LoginFormData } from "@/schemas/user/login.schema";
import { useMutation } from '@tanstack/react-query'
import apiClient from "@/lib/apiClient";

const login = async (
  payload: LoginFormData
): Promise<{ message: string }> => {
  const res = await apiClient.post("/api/user/login", payload);
  return res.data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginFormData) => login(payload),
    onError: (err: Error) => {
      handleServerError(err)
    },
    onSuccess: () => {
    },
  })
}
