import PageHeader from "@/components/page-header"

export default async function APIKeys() {
  return (
    <div className="mt-4 px-4">
      <PageHeader
        title="API Keys"
        description="Manage your API keys from here!"
        showBackButton={false}
      />
    </div>
  )
}
