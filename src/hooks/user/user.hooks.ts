import { handleServerError } from "@/lib/handle-server-error";
import { LoginFormData, PasswordChangeData } from "@/schemas/user/auth.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { User } from "@/schemas/user/user.schema";
import { toast } from "sonner";

const changePassword = async (
  payload: PasswordChangeData
): Promise<{
  data: {
    accessToken: string;
  };
}> => {
  const res = await apiClient.post("/api/user/change-password", payload);
  return res.data;
};

const login = async (
  payload: LoginFormData
): Promise<{
  data: {
    accessToken: string;
  };
}> => {
  const res = await apiClient.post("/api/user/login", payload);
  return res.data;
};


export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get("/api/user/profile");
  return response?.data?.data;
}

export const useGetProfile = (enabled = true) => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  })
}

export const useChangePassword = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PasswordChangeData) => changePassword(payload),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: async () => {
      toast("Password changed!");
      await queryClient.invalidateQueries({
        queryKey: ["profile"],
        exact: false
      })
    },
  });
};


export const useLogin = () => {
  const { setAccessToken, resetAuthStore } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginFormData) => login(payload),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: (data) => {
      const { accessToken } = data.data;
      if (accessToken) {
        setAccessToken(accessToken);
        router.replace("/");
      } else {
        resetAuthStore();
      }
    },
  });
};

export const useLogout = () => {
  const { resetAuthStore } = useAuthStore();
  const router = useRouter();
  return () => {
    // add required cleanups on logout
    resetAuthStore();
    router.replace("/login");
  };
};
