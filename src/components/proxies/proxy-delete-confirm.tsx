import { DeleteDomainValues } from '@/app/api/domain/domain-schema';
import { useDeleteDomain } from '@/hooks/domains/domain.hooks';
import { IconAlertTriangle } from '@tabler/icons-react';
import { FC } from 'react'
import { ConfirmDialog } from '../confirm-dialog';
import { DomainWithCheckResults } from '@/app/api/domain/domain-types';

type Props = {
    open: boolean;
    onCancel: VoidFunction;
    proxy: DomainWithCheckResults | null;
}

const ProxyDeleteConfirm: FC<Props> = ({
    open,
    onCancel,
    proxy,
}) => {
    if(!proxy) return null;
    
    const deleteDomainMutation = useDeleteDomain()
    const handleConfirmDelete = async () => {
        await deleteDomainMutation.mutateAsync({
            incomingAddress: proxy.incomingAddress
        })
        onCancel()
    }

    return (
        <ConfirmDialog
            key='delete-role-confirm'
            open={open}
            onOpenChange={onCancel}
            handleConfirm={handleConfirmDelete}
            isLoading={deleteDomainMutation.isPending}
            title={
                <span className='text-destructive'>
                    <IconAlertTriangle
                        className='mr-1 inline-block stroke-destructive'
                        size={18}
                    />{' '}
                    Delete Proxy
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        Are you sure you want to delete{' '}
                        <span className='font-bold'>{proxy.incomingAddress}</span>?
                        <br />
                        This cannot be undone.
                    </p>
                </div>
            }
            confirmText='Delete'
            destructive
        />
    )
}

export default ProxyDeleteConfirm