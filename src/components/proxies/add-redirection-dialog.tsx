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
import { addDomainSchema, AddDomainValues } from '@/app/api/domain/domain-schema'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { useAddDomain } from '@/hooks/domains/domain.hooks'
import { Checkbox } from '../ui/checkbox'

interface Props {
    open: boolean
    onClose: VoidFunction
}

export function AddRedirectionDialog({ open, onClose }: Props) {
    const addDomainMutation = useAddDomain()

    const form = useForm<AddDomainValues>({
        resolver: zodResolver(addDomainSchema),
        defaultValues: {
            domain: '',
            enableRedirection: true, 
            redirectTo: '',
            destinationAddress: '',
            port: '',
            enableHttps: true,
        },
    })

    const onSubmit = async (values: AddDomainValues) => {
        try {
            const processedValues = {
                ...values,
                enableRedirection: true, 
            };
            await addDomainMutation.mutateAsync(processedValues);
            form.reset();
            onClose();
        } catch (error) {
            console.error("Error submitting redirection:", error);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onClose}
        >
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader className='text-left'>
                    <DialogTitle>{'Add Redirection'}</DialogTitle>
                    <DialogDescription>
                        {'Set up a domain redirection.'}{' '}
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className='grid gap-6'>
                                <FormField
                                    control={form.control}
                                    name='domain'
                                    render={({ field }) => (
                                        <FormItem className='space-y-1'>
                                            <FormLabel>Source Domain</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter domain (e.g. example.com)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='redirectTo'
                                    render={({ field }) => (
                                        <FormItem className='space-y-1'>
                                            <FormLabel>Redirect To</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter target domain (e.g. newdomain.com)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="enableHttps"
                                    render={({ field: {
                                        value,
                                        onChange,
                                        ...restField
                                    } }) => (
                                        <FormItem className="space-y-1 flex items-center justify-start gap-2">
                                            <FormLabel>Enable HTTPS</FormLabel>
                                            <FormControl>
                                                <Checkbox checked={value} onCheckedChange={onChange} {...restField} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type='submit'
                                    className='mt-2 cursor-pointer'
                                    disabled={addDomainMutation.isPending}
                                >
                                    {addDomainMutation.isPending ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}