'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useGetRawConfig } from '@/hooks/domains/domain.hooks'
import { BoxLoader } from '../loader'
import { Button } from '@/components/ui/button'
import { Clipboard } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
    open: boolean
    onClose: VoidFunction
}

export function ViewRawDialog({ open, onClose }: Props) {
    const { data, isLoading } = useGetRawConfig()

    const handleCopy = () => {
        if (data) {
            navigator.clipboard.writeText(JSON.stringify(data, null, 4))
            toast.success('Copied to clipboard!')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-2xl'>
                <DialogHeader className='text-left'>
                    <DialogTitle>{'Raw Configuration'}</DialogTitle>
                    <DialogDescription>
                        Snippet below shows the raw caddy configuration in JSON format.
                    </DialogDescription>
                </DialogHeader>
                <div className='relative h-[560px] bg-gray-900 p-4 rounded-lg overflow-auto'>
                    {isLoading ? (
                        <BoxLoader height='h-44' />
                    ) : (
                        <pre className='text-gray-300 text-sm whitespace-pre-wrap'>
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    )}
                    <Button 
                        onClick={handleCopy} 
                        size='icon' 
                        variant='ghost' 
                        className='cursor-pointer absolute top-4 right-4 text-gray-400'
                    >
                        <Clipboard size={16} />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
