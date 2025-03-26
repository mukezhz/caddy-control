import { DomainWithCheckResults } from "@/app/api/domain/domain-types";
import apiClient from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export const getRegisteredDomains = async (): Promise<{
  data: DomainWithCheckResults[];
  total: number;
}> => {
  const response = await apiClient.get("/api/domain/registered");
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
