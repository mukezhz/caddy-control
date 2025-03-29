import React from 'react'
import { Button } from '../ui/button'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { useQueryClient, useIsFetching } from '@tanstack/react-query'

const ProxiesActions = () => {
    const queryClient = useQueryClient();
    const isFetchingDomains = useIsFetching({ queryKey: ["registered-domains"] });

    const refreshProxies = async () => {
        queryClient.invalidateQueries({
            queryKey: ["registered-domains"]
        })
    }

    const handleAddProxy = () => {

    }

    return (
        <div className='flex items-center justify-end gap-4'>
            <Button onClick={refreshProxies} className='cursor-pointer' variant={'outline'}>
                <span>
                    <IconRefresh className={isFetchingDomains ? 'animate-spin' : ''} />
                </span>
                Refresh
            </Button>
            <Button onClick={refreshProxies} className='cursor-pointer' variant={'default'}>
                <span>
                    <IconPlus className={isFetchingDomains ? 'animate-spin' : ''} />
                </span>
                Add Proxy
            </Button>
        </div>
    )
}

export default ProxiesActions