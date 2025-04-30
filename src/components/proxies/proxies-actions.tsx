import React, { useState } from 'react'
import { Button } from '../ui/button'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { useQueryClient, useIsFetching } from '@tanstack/react-query'
import { AddProxyDialog } from './add-proxy-dialog'
import { Eye } from 'lucide-react'
import { ViewRawDialog } from './view-raw-dialog'
import { hasPermission } from '@/store/authStore'
import { Resources } from '@/config/resources'

const ProxiesActions = () => {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [rawDialogOpen, setRawDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const isFetchingDomains = useIsFetching({ queryKey: ["registered-domains"] });
    
    // Check if user has permissions to add proxies
    const canModifyProxies = hasPermission(Resources.WithManage(Resources.PROXY_MANAGEMENT));

    const refreshProxies = async () => {
        queryClient.invalidateQueries({
            queryKey: ["registered-domains"]
        })
    }

    const handleAddProxy = () => {
        setAddDialogOpen(true)
    }

    const handlViewRaw = () => {
        setRawDialogOpen(true)
    }

    return (
        <>
            <div className='flex items-center justify-end gap-4'>
                <Button onClick={refreshProxies} className='cursor-pointer' variant={'outline'}>
                    <span>
                        <IconRefresh className={isFetchingDomains ? 'animate-spin' : ''} />
                    </span>
                    Refresh
                </Button>
                <Button onClick={handlViewRaw} className='cursor-pointer' variant={'outline'}>
                    <span>
                        <Eye />
                    </span>
                    View Raw JSON
                </Button>
                {canModifyProxies && (
                    <Button onClick={handleAddProxy} className='cursor-pointer' variant={'default'}>
                        <span>
                            <IconPlus />
                        </span>
                        Add Proxy
                    </Button>
                )}
            </div>
            <AddProxyDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
            />
            <ViewRawDialog
                open={rawDialogOpen}
                onClose={() => setRawDialogOpen(false)}
            />
        </>
    )
}

export default ProxiesActions