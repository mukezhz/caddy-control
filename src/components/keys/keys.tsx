import { GetKeysResponse } from "@/app/api/keys/keys-schema";
import { useState } from "react";
import { Button } from "../ui/button";
import { Trash, Clipboard, Eye, EyeOff } from "lucide-react";
import KeyDeleteConfirm from "./key-delete-confirm";
import { toast } from "sonner";
import { hasPermission } from "@/store/authStore";

type Props = {
  keysData: {
    data: GetKeysResponse[];
    total: number;
  } | undefined;
};

const Keys = ({ keysData }: Props) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedKey, setSelectedKey] = useState<GetKeysResponse | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<{ [key: number]: boolean }>({});
  
  // Check if user has permission to delete API keys
  const canDeleteKey = hasPermission('api_keys:manage') || hasPermission('api_keys:modify');

  const handleDeleteCancel = () => {
    setOpenDelete(false);
    setSelectedKey(null);
  };

  const handleDeleteClick = (selectedKey: GetKeysResponse) => {
    setSelectedKey(selectedKey);
    setOpenDelete(true);
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast("Copied to clipboard!");
  };

  const toggleVisibility = (index: number) => {
    setVisibleKeys((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <>
      <div className="space-y-4 mt-2 overflow-y-auto max-h-[400px] p-2">
        <div>
          Found <span className="font-bold">{keysData?.total}</span> record
          {keysData && keysData?.total > 1 ? "s." : "."}
        </div>
        <div className="space-y-3 pr-2">
          {keysData?.data.map((record, index) => (
            <div key={index} className="border-l-4 border-gray-600 pl-4 pr-2 py-1 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">{record.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 truncate max-w-[250px]">
                    {visibleKeys[index] ? record.key : `${record.key.substring(0,4)} * * * * * * * * *`}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleVisibility(index)}
                    className="cursor-pointer hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                  >
                    {visibleKeys[index] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleCopy(record.key)}
                  className="cursor-pointer hover:bg-blue-100 text-blue-500 hover:text-blue-600"
                >
                  <Clipboard size={16} />
                </Button>
                {canDeleteKey && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteClick(record)}
                    className="cursor-pointer hover:bg-red-100 text-red-400 hover:text-red-500"
                  >
                    <Trash size={16} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <KeyDeleteConfirm
        open={openDelete}
        onCancel={handleDeleteCancel}
        selectedKey={selectedKey}
      />
    </>
  );
};

export default Keys;
