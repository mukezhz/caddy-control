import { handleServerError } from "@/lib/handle-server-error";
import { AdminPasswordResetData, CreateUserData, LoginFormData, PasswordChangeData } from "@/schemas/user/auth.schema";
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

const createUser = async (
  payload: CreateUserData
): Promise<{
  data: User;
}> => {
  const res = await apiClient.post("/api/user/create", payload);
  return res.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get("/api/user/profile");
  return response?.data?.data;
};

export const getUsers = async (): Promise<{
  data: User[];
  total: number;
}> => {
  const response = await apiClient.get("/api/user/list");
  return response?.data;
};

export const useGetUsers = (enabled = true) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  });
};

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

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserData) => createUser(payload),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: async () => {
      toast("User created successfully!");
      await queryClient.invalidateQueries({
        queryKey: ["users"],
        exact: false,
      });
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
    resetAuthStore();
    router.replace("/login");
  };
};

const adminResetPassword = async (
  payload: AdminPasswordResetData
): Promise<{
  data: {
    message: string;
  }
}> => {
  const res = await apiClient.post(`/api/user/admin-reset-password`, payload);
  return res.data;
};

const deleteUser = async (userId: string): Promise<{
  data: {
    message: string;
  }
}> => {
  const res = await apiClient.delete(`/api/user/${userId}`);
  return res.data;
};

export const useAdminResetPassword = () => {
  return useMutation({
    mutationFn: (payload: AdminPasswordResetData) => adminResetPassword(payload),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: () => {
      toast("Password has been reset successfully!");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: async () => {
      toast("User deleted successfully!");
      await queryClient.invalidateQueries({
        queryKey: ["users"],
        exact: false,
      });
    },
  });
};
