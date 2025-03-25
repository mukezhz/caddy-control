import PageHeader from "@/components/page-header"

export default async function Home() {
  return (
    <div className="mt-4 px-4">
      <PageHeader
        title="Dashboard"
        description="Manage your proxies from here!"
        showBackButton={false}
      />
    </div>
  )
}
