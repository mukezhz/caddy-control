'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { useAddKey } from '@/hooks/keys/keys.hooks'
import { addKeySchema, AddKeyValues } from '@/app/api/keys/keys-schema'

interface Props {
    open: boolean
    onClose: VoidFunction
}

export function CreateKeyDialog({ open, onClose }: Props) {
    const addKeyMutation = useAddKey()

    const form = useForm<AddKeyValues>({
        resolver: zodResolver(addKeySchema),
        defaultValues: {
            name: ''
        }
    })

    const onSubmit = async (values: AddKeyValues) => {
        await addKeyMutation.mutateAsync(values);
        form.reset()
        onClose()
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onClose}
        >
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader className='text-left'>
                    <DialogTitle>{'Create API Key'}</DialogTitle>
                    <DialogDescription>
                        {'Enter the details below.'}{' '}
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className='grid gap-6'>
                                <FormField
                                    control={form.control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem className='space-y-1'>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter identifying name of the key" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button loading={addKeyMutation.isPending} type='submit' className='mt-2 cursor-pointer' disabled={false}>
                                    Save
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
