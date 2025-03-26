import { DomainWithCheckResults } from "@/app/api/domain/domain-types";
import { Check, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type Props = {
  proxyData: {
    data: DomainWithCheckResults[];
    total: number;
  } | undefined
}

type ProxyRecordProps = {
  record: DomainWithCheckResults
}

const ProxyRecord = ({ record }: ProxyRecordProps) => {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="font-semibold">
        {record.incomingAddress}
      </div>
      <div className="text-sm text-gray-500">
        Routes to <span className="font-bold text-gray-700">{record.destinationAddress}</span> on port <span className="font-bold text-gray-700">{record.port}</span>
      </div>
    </div>
  )
}

const ProxyRecordCheckResults = ({ record }: ProxyRecordProps) => {
  return (
    <div className="flex items-center justify-end gap-6">
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
    </div>
  )
}

const Proxies = ({ proxyData }: Props) => {
  return (
    <div className="space-y-4 mt-2 overflow-y-scroll">
      <div>
        Found <span className="font-bold">{proxyData?.total}</span> record{proxyData && proxyData?.total > 1 ? 's.' : '.'}
      </div>
      <div>
        {proxyData?.data.map((record, index) => (
          <div key={index} className="border-l-4 border-gray-600 pl-4 pr-2 py-1 flex items-center justify-between">
            <ProxyRecord record={record} />
            <ProxyRecordCheckResults record={record} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Proxies;
