import { MainConfig } from "@/app/api/_services/caddy/template-types";
import { AddDomainValues } from "@/app/api/domain/domain-schema";
import { DomainWithCheckResults } from "@/app/api/domain/domain-types";
import apiClient from "@/lib/api-client";
import { handleServerError } from "@/lib/handle-server-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const getRegisteredDomains = async (): Promise<{
  data: DomainWithCheckResults[];
  total: number;
}> => {
  const response = await apiClient.get("/api/domain/registered");
  return response?.data;
};

export const getRawConfig = async (): Promise<MainConfig> => {
  const response = await apiClient.get("/api/domain/config");
  return response?.data;
};

export const addDomain = async (
  payload: AddDomainValues
): Promise<{
  data: DomainWithCheckResults;
  total: number;
}> => {
  const response = await apiClient.post("/api/domain/add", payload);
  return response?.data;
};

export const useGetRegisteredDomains = (enabled = true) => {
  return useQuery({
    queryKey: ["registered-domains"],
    queryFn: getRegisteredDomains,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  });
};

export const useGetRawConfig = (enabled = true) => {
  return useQuery({
    queryKey: ["raw-config"],
    queryFn: getRawConfig,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  });
};

export const useAddDomain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddDomainValues) => addDomain(payload),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: async () => {
      toast("Proxy added!");
      await queryClient.invalidateQueries({
        queryKey: ["registered-domains"],
        exact: false,
      });
      await queryClient.invalidateQueries({
        queryKey: ["raw-config"],
        exact: false,
      });
    },
  });
};
