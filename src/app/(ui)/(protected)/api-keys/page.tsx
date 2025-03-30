"use client";

import Keys from "@/components/keys/keys";
import KeyActions from "@/components/keys/keys-actions";
import { BoxLoader } from "@/components/loader";
import PageHeader from "@/components/page-header"
import { Separator } from "@/components/ui/separator"
import { useGetKeys } from "@/hooks/keys/keys.hooks";

export default function APIKeys() {
  const { data, isLoading } = useGetKeys();

  console.log(data)

  return (
    <div className="mt-4 px-4 mb-24 flex flex-col h-full">
      <PageHeader
        title="API Keys"
        description="Manage your API keys from here!"
        actions={<KeyActions />}
        showBackButton={false}
      />
      <Separator />
      {isLoading ? (
        <BoxLoader height="h-[24vh]" />
      ) : (
        <Keys keysData={data} />
      )}
    </div>
  )
}
