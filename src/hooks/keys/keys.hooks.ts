import { AddKeyValues, DeleteKeyValues, GetKeysResponse } from "@/app/api/keys/keys-schema";
import apiClient from "@/lib/api-client";
import { handleServerError } from "@/lib/handle-server-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const getKeys = async (): Promise<{
  data: GetKeysResponse[];
  total: number;
}> => {
  const response = await apiClient.get("/api/keys");
  return response?.data;
};

export const addKey = async (
  payload: AddKeyValues
): Promise<{
  data: GetKeysResponse;
}> => {
  const response = await apiClient.post("/api/keys", payload);
  return response?.data;
};

export const deleteKey = async (
  payload: DeleteKeyValues
): Promise<{
  data: GetKeysResponse;
}> => {
  const response = await apiClient.delete("/api/keys", {
    data: payload
  });
  return response?.data;
};

export const useGetKeys = (enabled = true) => {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: getKeys,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  });
};

export const useAddKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddKeyValues) => addKey(payload),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: async () => {
      toast("API key created!");
      await queryClient.invalidateQueries({
        queryKey: ["api-keys"],
        exact: false,
      });
    },
  });
};

export const useDeleteKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeleteKeyValues) => deleteKey(payload),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: async () => {
      toast("API key deleted!");
      await queryClient.invalidateQueries({
        queryKey: ["api-keys"],
        exact: false,
      });
    },
  });
};
