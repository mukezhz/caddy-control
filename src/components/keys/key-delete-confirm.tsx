import { useDeleteDomain } from '@/hooks/domains/domain.hooks';
import { IconAlertTriangle } from '@tabler/icons-react';
import { FC } from 'react'
import { ConfirmDialog } from '../confirm-dialog';
import { GetKeysResponse } from '@/app/api/keys/keys-schema';
import { useDeleteKey } from '@/hooks/keys/keys.hooks';

type Props = {
    open: boolean;
    onCancel: VoidFunction;
    selectedKey: GetKeysResponse | null;
}

const KeyDeleteConfirm: FC<Props> = ({
    open,
    onCancel,
    selectedKey,
}) => {
    if (!selectedKey) return null;

    const deleteKeyMutation = useDeleteKey()
    const handleConfirmDelete = async () => {
        await deleteKeyMutation.mutateAsync({
            key: selectedKey.key
        })
        onCancel()
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onCancel}
            handleConfirm={handleConfirmDelete}
            isLoading={deleteKeyMutation.isPending}
            title={
                <span className='text-destructive'>
                    <IconAlertTriangle
                        className='mr-1 inline-block stroke-destructive'
                        size={18}
                    />{' '}
                    Delete Key
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        Are you sure you want to delete{' '}
                        <span className='font-bold'>{selectedKey.name}</span>?
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

export default KeyDeleteConfirm