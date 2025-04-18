import { DomainWithCheckResults } from "@/app/api/domain/domain-types";
import { Check, Trash, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import ProxyDeleteConfirm from "./proxy-delete-confirm";
import { useState } from "react";
import { hasPermission } from "@/store/authStore";

type Props = {
  proxyData: {
    data: DomainWithCheckResults[];
    total: number;
  } | undefined
}

interface ProxyRecordProps {
  record: DomainWithCheckResults
}

interface ProxyCheckResults extends ProxyRecordProps {
  handleDeleteClick: (selectedProxy: DomainWithCheckResults) => void
}

const ProxyRecord = ({ record }: ProxyRecordProps) => {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="font-semibold flex items-center justify-start gap-2">
        {record.incomingAddress}
        {
          record.enableHttps && (
            <span><Badge variant={'outline'}>SSL Enabled</Badge></span>
          )
        }
        {
          record.redirectUrl && (
            <span><Badge variant={'outline'} className="bg-blue-50">Redirects to {record.redirectUrl}</Badge></span>
          )
        }
      </div>
      <div className="text-sm text-gray-500">
        {!record.redirectUrl && (
          <>Proxy to <span className="font-bold text-gray-700">{record.destinationAddress}</span> on port <span className="font-bold text-gray-700">{record.port}</span></>
        )}
      </div>
    </div>
  )
}

const ProxyRecordCheckResults = ({ record, handleDeleteClick }: ProxyCheckResults) => {
  // Check if user has permission to delete proxies
  const canDeleteProxy = hasPermission('proxies:manage') || hasPermission('proxies:modify');
  
  return (
    <div className="flex items-center justify-start gap-6">
      <div className="flex items-center justify-start gap-1 text-md text-gray-500">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-start gap-1 text-md text-gray-500">
              DNS {record.checkResults.dnsCheck.result ? (
                <Check className="text-green-500" />
              ) : (
                <X className="text-red-400" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{record.checkResults.dnsCheck.description}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center justify-start gap-1 text-md text-gray-500">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-start gap-1 text-md text-gray-500">
              Resolving {record.checkResults.proxyReachability.result ? <Check className="text-green-500" /> : <X className="text-red-400" />}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{record.checkResults.proxyReachability.description}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      {canDeleteProxy && (
        <Button
          size='icon'
          variant='ghost'
          disabled={record.isLocked}
          onClick={() => handleDeleteClick(record)}
          className="cursor-pointer hover:bg-red-100 text-red-400 hover:text-red-500"
        >
          <Trash />
        </Button>
      )}
    </div>
  )
}

const Proxies = ({ proxyData }: Props) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<DomainWithCheckResults | null>(null)

  const handleDeleteCancel = () => {
    setOpenDelete(false)
    setSelectedProxy(null);
  }

  const handleDeleteClick = (selectedProxy: DomainWithCheckResults) => {
    setSelectedProxy(selectedProxy);
    setOpenDelete(true)
  }

  return (
    <>
      <div className="space-y-4 mt-2 overflow-y-scroll">
        <div>
          Found <span className="font-bold">{proxyData?.total}</span> record{proxyData && proxyData?.total > 1 ? 's.' : '.'}
        </div>
        <div className="space-y-4 pr-4">
          {proxyData?.data.map((record, index) => (
            <div key={index} className="border-l-4 border-gray-600 pl-4 pr-2 py-1 flex items-center justify-between">
              <ProxyRecord record={record} />
              <ProxyRecordCheckResults handleDeleteClick={handleDeleteClick} record={record} />
            </div>
          ))}
        </div>
      </div>
      <ProxyDeleteConfirm
        open={openDelete}
        onCancel={handleDeleteCancel}
        proxy={selectedProxy}
      />
    </>
  );
};

export default Proxies;
