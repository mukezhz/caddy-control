import React, { useState } from 'react'
import { Button } from '../ui/button'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { useQueryClient, useIsFetching } from '@tanstack/react-query'
import { CreateKeyDialog } from './create-key-dialog'

const KeyActions = () => {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const isFetchingKeys = useIsFetching({ queryKey: ["api-keys"] });

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
                <Button onClick={handleAddProxy} className='cursor-pointer' variant={'default'}>
                    <span>
                        <IconPlus />
                    </span>
                    Create API Key
                </Button>
            </div>
            <CreateKeyDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
            />
        </>
    )
}

export default KeyActions