"use client";

import { BoxLoader } from "@/components/loader";
import PageHeader from "@/components/page-header";
import Proxies from "@/components/proxies/proxies";
import ProxiesActions from "@/components/proxies/proxies-actions";
import { Separator } from "@/components/ui/separator";
import { useGetRegisteredDomains } from "@/hooks/domains/domain.hooks";
import { useGetProfile } from "@/hooks/user/user.hooks";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { accessToken, setUser } = useAuthStore();
  const { data, isLoading } = useGetRegisteredDomains();
  const [checking, setChecking] = useState(true);
  const { data: userData, isLoading: isLoadingProfile } = useGetProfile(!!accessToken);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken && !checking) {
      router.push("/login");
    } else {
      setChecking(false);
    }
  }, [accessToken, router, checking]);


  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData, setUser]);

  if (isLoadingProfile) {
    return (
      <BoxLoader />
    );
  }

  if (checking) return null;

  return (
    <div className="mt-4 px-4 mb-24 flex flex-col h-full">
      <PageHeader
        title="Proxies"
        description="Manage your proxies from here!"
        showBackButton={false}
        actions={<ProxiesActions />}
      />
      <Separator />
      {isLoading ? (
        <BoxLoader height="h-[24vh]" />
      ) : (
        <Proxies proxyData={data} />
      )}
    </div>
  );
}
