import React, { useState } from 'react'
import { Button } from '../ui/button'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { useQueryClient, useIsFetching } from '@tanstack/react-query'
import { AddProxyDialog } from './add-proxy-dialog'
import { Eye, ArrowRight } from 'lucide-react'
import { ViewRawDialog } from './view-raw-dialog'
import { hasPermission } from '@/store/authStore'
import { Resources } from '@/config/resources'
import { AddRedirectionDialog } from './add-redirection-dialog'

const ProxiesActions = () => {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [addRedirectionOpen, setAddRedirectionOpen] = useState(false);
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

    const handleAddRedirection = () => {
        setAddRedirectionOpen(true)
    }

    const handlViewRaw = () => {
        setRawDialogOpen(true)
    }

    return (
        <>
            <div className='flex items-center justify-end gap-4 flex-wrap'>
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
                    <>
                        <Button onClick={handleAddRedirection} className='cursor-pointer' variant={'outline'}>
                            <span className="mr-1">
                                <ArrowRight size={16} />
                            </span>
                            Add Redirection
                        </Button>
                        <Button onClick={handleAddProxy} className='cursor-pointer' variant={'default'}>
                            <span>
                                <IconPlus />
                            </span>
                            Add Proxy
                        </Button>
                    </>
                )}
            </div>
            <AddProxyDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
            />
            <AddRedirectionDialog
                open={addRedirectionOpen}
                onClose={() => setAddRedirectionOpen(false)}
            />
            <ViewRawDialog
                open={rawDialogOpen}
                onClose={() => setRawDialogOpen(false)}
            />
        </>
    )
}

export default ProxiesActions