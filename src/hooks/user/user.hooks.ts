import { handleServerError } from "@/lib/handle-server-error";
import { LoginFormData } from "@/schemas/user/login.schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { User } from "@/schemas/user/user.schema";

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
