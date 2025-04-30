import { MainConfig } from "@/app/api/_services/caddy/template-types";
import { AddDomainValues, DeleteDomainValues } from "@/app/api/domain/domain-schema";
import { DomainWithCheckResults } from "@/app/api/domain/domain-types";
import apiClient from "@/lib/api-client";
import { handleServerError } from "@/lib/handle-server-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types for domain import functionality
export type ParsedDomain = {
  incomingAddress: string;
  destinationAddress: string;
  port: number;
  enableHttps: boolean;
  redirectUrl?: string;
  isValid: boolean;
  errorMessage?: string;
};

export type ImportResult = {
  success: number;
  failed: number;
};

export type ImportDomainsOptions = {
  parsedDomains: ParsedDomain[];
  configText: string;
};

// Define query keys as constants to avoid string duplication and typos
export const QUERY_KEYS = {
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

  deleteDomain: async (payload: DeleteDomainValues): Promise<DomainResponse> => {
    const response = await apiClient.delete("/api/domain/remove", {
      data: payload
    });
    return response?.data;
  },

  importDomains: async (options: ImportDomainsOptions): Promise<ImportResult> => {
    const { parsedDomains, configText } = options;

    if (!parsedDomains.length) {
      return { success: 0, failed: 0 };
    }

    let successCount = 0;
    let failCount = 0;

    try {
      // Save the Caddy configuration first
      await apiClient.post('/api/config/import', {
        config: JSON.parse(configText)
      });

      // Then add each domain
      for (const domain of parsedDomains) {
        if (!domain.isValid) {
          failCount += 1;
          continue;
        }

        try {
          if (domain.redirectUrl) {
            // Add redirect domain
            await domainService.addDomain({
              domain: domain.incomingAddress,
              enableRedirection: true,
              redirectTo: domain.redirectUrl,
              enableHttps: domain.enableHttps,
              destinationAddress: "",
              port: "0"
            });
          } else {
            // Add regular domain
            await domainService.addDomain({
              domain: domain.incomingAddress,
              enableRedirection: false,
              destinationAddress: domain.destinationAddress,
              port: domain.port.toString(),
              enableHttps: domain.enableHttps
            });
          }
          successCount += 1;
        } catch (error) {
          console.error("Error importing domain:", domain.incomingAddress, error);
          failCount += 1;
        }
      }

      return {
        success: successCount,
        failed: failCount
      };
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  }
};

const invalidateDomainQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOMAINS], exact: false }),
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONFIG], exact: false })
  ]);
};

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

export const useImportDomains = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: domainService.importDomains,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async (result) => {
      if (result.success > 0) {
        toast.success(`Successfully imported ${result.success} domains`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} domains`);
      }
      await invalidateDomainQueries(queryClient);
    },
  });
};
