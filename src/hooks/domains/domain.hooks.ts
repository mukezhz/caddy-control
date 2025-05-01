import { MainConfig } from "@/app/api/_services/caddy/template-types";
import {
  AddDomainValues,
  DeleteDomainValues,
} from "@/app/api/domain/domain-schema";
import { DomainWithCheckResults } from "@/app/api/domain/domain-types";
import apiClient from "@/lib/api-client";
import { handleServerError } from "@/lib/handle-server-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Define query keys as constants to avoid string duplication and typos
const QUERY_KEYS = {
  DOMAINS: "registered-domains",
  CONFIG: "raw-config",
} as const;

type DomainsResponse = {
  data: DomainWithCheckResults[];
  total: number;
};

type DomainResponse = {
  data: DomainWithCheckResults;
};

// API service functions
export const domainService = {
  getRegisteredDomains: async (): Promise<DomainsResponse> => {
    const response = await apiClient.get("/api/domain/registered");
    return response?.data;
  },

  getRawConfig: async (): Promise<MainConfig> => {
    const response = await apiClient.get("/api/domain/config");
    return response?.data;
  },

  addDomain: async (payload: AddDomainValues): Promise<DomainResponse> => {
    const response = await apiClient.post("/api/domain/add", payload);
    return response?.data;
  },

  deleteDomain: async (
    payload: DeleteDomainValues
  ): Promise<DomainResponse> => {
    const response = await apiClient.delete("/api/domain/remove", {
      data: payload,
    });
    return response?.data;
  },
};

// Helper to invalidate common domain queries
const invalidateDomainQueries = async (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.DOMAINS],
      exact: false,
    }),
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.CONFIG],
      exact: false,
    }),
  ]);
};

// React Query hooks
export const useGetRegisteredDomains = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DOMAINS],
    queryFn: domainService.getRegisteredDomains,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  });
};

export const useGetRawConfig = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CONFIG],
    queryFn: domainService.getRawConfig,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  });
};

export const useAddDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: domainService.addDomain,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async () => {
      toast("Proxy added!");
      await invalidateDomainQueries(queryClient);
    },
  });
};

export const useDeleteDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: domainService.deleteDomain,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async () => {
      toast("Proxy deleted!");
      await invalidateDomainQueries(queryClient);
    },
  });
};
