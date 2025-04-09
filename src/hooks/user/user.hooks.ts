import { handleServerError } from "@/lib/handle-server-error";
import { AdminPasswordResetData, CreateUserData, LoginFormData, PasswordChangeData } from "@/schemas/user/auth.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { User } from "@/schemas/user/user.schema";
import { toast } from "sonner";

// Define query keys as constants
const QUERY_KEYS = {
  USERS: "users",
  PROFILE: "profile",
} as const;

type UsersResponse = {
  data: User[];
  total: number;
};

type UserResponse = {
  data: User;
};

type AuthResponse = {
  data: {
    accessToken: string;
  };
};

type MessageResponse = {
  data: {
    message: string;
  };
};

// API service functions
export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get("/api/user/profile");
    return response?.data?.data;
  },

  getUsers: async (): Promise<UsersResponse> => {
    const response = await apiClient.get("/api/user/list");
    return response?.data;
  },

  login: async (payload: LoginFormData): Promise<AuthResponse> => {
    const res = await apiClient.post("/api/user/login", payload);
    return res.data;
  },

  changePassword: async (payload: PasswordChangeData): Promise<AuthResponse> => {
    const res = await apiClient.post("/api/user/change-password", payload);
    return res.data;
  },

  createUser: async (payload: CreateUserData): Promise<UserResponse> => {
    const res = await apiClient.post("/api/user/create", payload);
    return res.data;
  },

  adminResetPassword: async (payload: AdminPasswordResetData): Promise<MessageResponse> => {
    const res = await apiClient.post(`/api/user/admin-reset-password`, payload);
    return res.data;
  },

  deleteUser: async (userId: string): Promise<MessageResponse> => {
    const res = await apiClient.delete(`/api/user/${userId}`);
    return res.data;
  }
};

// React Query hooks
export const useGetUsers = (enabled = true) => {
  try {
    return useQuery({
      queryKey: [QUERY_KEYS.USERS],
      queryFn: userService.getUsers,
      staleTime: 0,
      refetchOnMount: true,
      enabled,
    });
  } catch (error) {
    // Return a default state when used outside QueryClientProvider
    console.warn("useGetUsers called outside of QueryClientProvider", error);
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({}),
    };
  }
};

export const useGetProfile = (enabled = true) => {
  try {
    return useQuery({
      queryKey: [QUERY_KEYS.PROFILE],
      queryFn: userService.getProfile,
      staleTime: 0,
      refetchOnMount: true,
      enabled,
    });
  } catch (error) {
    // Return a default state when used outside QueryClientProvider
    console.warn("useGetProfile called outside of QueryClientProvider", error);
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({}),
    };
  }
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.changePassword,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async () => {
      toast("Password changed!");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROFILE],
        exact: false
      });
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.createUser,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async () => {
      toast("User created successfully!");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS],
        exact: false,
      });
    },
  });
};

export const useLogin = () => {
  const { setAccessToken, resetAuthStore } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: userService.login,
    throwOnError: false,
    onError: handleServerError,
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

export const useAdminResetPassword = () => {
  return useMutation({
    mutationFn: userService.adminResetPassword,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: () => {
      toast("Password has been reset successfully!");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.deleteUser,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async () => {
      toast("User deleted successfully!");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS],
        exact: false,
      });
    },
  });
};
