import { AddKeyValues, DeleteKeyValues, GetKeysResponse } from "@/app/api/keys/keys-schema";
import apiClient from "@/lib/api-client";
import { handleServerError } from "@/lib/handle-server-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Define query keys as constants
const QUERY_KEYS = {
  API_KEYS: "api-keys",
} as const;

type KeysResponse = {
  data: GetKeysResponse[];
  total: number;
};

type KeyResponse = {
  data: GetKeysResponse;
};

// API service functions
export const keysService = {
  getKeys: async (): Promise<KeysResponse> => {
    const response = await apiClient.get("/api/keys");
    return response?.data;
  },

  addKey: async (payload: AddKeyValues): Promise<KeyResponse> => {
    const response = await apiClient.post("/api/keys", payload);
    return response?.data;
  },

  deleteKey: async (payload: DeleteKeyValues): Promise<KeyResponse> => {
    const response = await apiClient.delete("/api/keys", {
      data: payload
    });
    return response?.data;
  }
};

// React Query hooks
export const useGetKeys = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.API_KEYS],
    queryFn: keysService.getKeys,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  });
};

export const useAddKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: keysService.addKey,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async () => {
      toast("API key created!");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.API_KEYS],
        exact: false,
      });
    },
  });
};

export const useDeleteKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: keysService.deleteKey,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async () => {
      toast("API key deleted!");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.API_KEYS],
        exact: false,
      });
    },
  });
};
