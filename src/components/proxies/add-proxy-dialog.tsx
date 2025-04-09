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

export function AddProxyDialog({ open, onClose }: Props) {
    const addDomainMutation = useAddDomain()

    const form = useForm<AddDomainValues>({
        resolver: zodResolver(addDomainSchema),
        defaultValues: {
            domain: '',
            enableRedirection: false,
            redirectTo: '',
            destinationAddress: '',
            port: '',
            enableHttps: true
        },
    })

    const onSubmit = async (values: AddDomainValues) => {
        try {
            const processedValues = {
                ...values,
                port: values.port || '80',
                redirectTo: values.enableRedirection ? values.redirectTo?.trim() || undefined : undefined
            };
            if (values.enableRedirection) {
                processedValues.destinationAddress = '';
                processedValues.port = null;
            }
            
            await addDomainMutation.mutateAsync(processedValues);
            form.reset();
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onClose}
        >
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader className='text-left'>
                    <DialogTitle>{'Add Proxy'}</DialogTitle>
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
                                    name='domain'
                                    render={({ field }) => (
                                        <FormItem className='space-y-1'>
                                            <FormLabel>Domain</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter domain (e.g. example.com)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name='enableRedirection'
                                    render={({ field: { value, onChange, ...restField } }) => (
                                        <FormItem className="space-y-1 flex items-center gap-2">
                                            <FormLabel>Enable Redirection</FormLabel>
                                            <FormControl>
                                                <Checkbox checked={value} onCheckedChange={onChange} {...restField} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                {form.watch('enableRedirection') && (
                                    <FormField
                                        control={form.control}
                                        name='redirectTo'
                                        render={({ field }) => (
                                            <FormItem className='space-y-1'>
                                                <FormLabel>Redirect To</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter redirect domain (e.g. example.com)" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {!form.watch('enableRedirection') && (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name='destinationAddress'
                                            render={({ field }) => (
                                                <FormItem className='space-y-1'>
                                                    <FormLabel>Destination Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter destination address" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name='port'
                                            render={({ field }) => (
                                                <FormItem className='space-y-1'>
                                                    <FormLabel>Destination Port</FormLabel>
                                                    <FormControl>
                                                        <Input type='number' placeholder="Enter destination port" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}
                                
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
