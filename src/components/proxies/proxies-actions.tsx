import React, { useState } from 'react'
import { Button } from '../ui/button'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { useQueryClient, useIsFetching } from '@tanstack/react-query'
import { AddProxyDialog } from './add-proxy-dialog'
import { Eye, ArrowRight, Import } from 'lucide-react'
import { ViewRawDialog } from './view-raw-dialog'
import { hasPermission, useAuthStore } from '@/store/authStore'
import { Resources } from '@/config/resources'
import { AddRedirectionDialog } from './add-redirection-dialog'
import { QUERY_KEYS, useAddDomain } from '@/hooks/domains/domain.hooks'
import { DomainImportDialogs } from './domain-import-dialogs'

/**
 * ProxiesActions component provides UI for managing domains and proxies
 */
const ProxiesActions = () => {
    // State for dialog visibility
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [addRedirectionOpen, setAddRedirectionOpen] = useState(false);
    const [rawDialogOpen, setRawDialogOpen] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);

    // Fetch domain data
    const queryClient = useQueryClient();
    const isFetchingDomains = useIsFetching({ queryKey: [QUERY_KEYS.DOMAINS] });
    
    // User permissions
    const { user } = useAuthStore();
    const canModifyProxies = hasPermission(Resources.WithManage(Resources.PROXY_MANAGEMENT));
    const canManageDomains = user?.isAdmin;

    // Handlers
    const refreshProxies = async () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.DOMAINS]
        })
    }

    const handleAddProxy = () => {
        setAddDialogOpen(true)
    }

    const handleAddRedirection = () => {
        setAddRedirectionOpen(true)
    }

    const handleViewRaw = () => {
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
                <Button variant="outline" onClick={() => setShowImportDialog(true)} disabled={!canManageDomains}>
                    <Import className="mr-2 h-4 w-4" />
                    Import Configuration
                </Button>
                <Button onClick={handleViewRaw} className='cursor-pointer' variant={'outline'}>
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

            {/* Dialogs */}
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
            
            {/* Import configuration dialogs */}
            <DomainImportDialogs 
                showImportDialog={showImportDialog}
                setShowImportDialog={setShowImportDialog}
            />
        </>
    )
}

export default ProxiesActions