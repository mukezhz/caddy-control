import React, { useState } from 'react'
import { Button } from '../ui/button'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { useQueryClient, useIsFetching } from '@tanstack/react-query'
import { CreateKeyDialog } from './create-key-dialog'
import { hasPermission } from '@/store/authStore'
import { Resources } from '@/config/resources'

const KeyActions = () => {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const isFetchingKeys = useIsFetching({ queryKey: ["api-keys"] });
    
    // Check if user has permissions to create API keys
    const canModifyKeys = hasPermission(Resources.WithManage(Resources.API_MANAGEMENT));

    const refreshKeys = async () => {
        queryClient.invalidateQueries({
            queryKey: ["api-keys"]
        })
    }

    const handleAddProxy = () => {
        setAddDialogOpen(true)
    }

    return (
        <>
            <div className='flex items-center justify-end gap-4'>
                <Button onClick={refreshKeys} className='cursor-pointer' variant={'outline'}>
                    <span>
                        <IconRefresh className={isFetchingKeys ? 'animate-spin' : ''} />
                    </span>
                    Refresh
                </Button>
                {canModifyKeys && (
                    <Button onClick={handleAddProxy} className='cursor-pointer' variant={'default'}>
                        <span>
                            <IconPlus />
                        </span>
                        Create API Key
                    </Button>
                )}
            </div>
            <CreateKeyDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
            />
        </>
    )
}

export default KeyActions