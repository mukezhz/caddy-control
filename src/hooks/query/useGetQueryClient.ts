import { handleServerError } from "@/lib/handle-server-error";
import { resetAuth } from "@/store/authStore";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useGetQueryClient = () => {
  const router = useRouter();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (failureCount > 3) return false;

          return !(
            error instanceof AxiosError &&
            [401, 403].includes(error.response?.status ?? 0)
          );
        },
        refetchOnWindowFocus: false,
        staleTime: 10 * 1000, // 10s
      },
      mutations: {
        onError: (error) => {
          handleServerError(error);

          if (error instanceof AxiosError) {
            if (error.response?.status === 304) {
              toast("Content not modified!");
            }
          }
        },
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            toast("Session expired!");
            resetAuth();
            router.replace("/login");
          }
          if (error.response?.status === 500) {
            toast("Internal Server Error!");
          }
        }
      },
    }),
  });

  return queryClient;
};
