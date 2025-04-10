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
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ActivityIcon, LockIcon } from 'lucide-react'

// Replace schema extension with manual merging
const extendedAddDomainSchema = z.object({
    domain: z.string(),
    enableRedirection: z.boolean().default(false),
    redirectTo: z.string().optional(),
    destinationAddress: z.string(),
    port: z.string(),
    enableHttps: z.boolean().default(true),
    enableAdvancedSettings: z.boolean().optional(),
    basicAuthUsername: z.string().optional(),
    basicAuthPassword: z.string().optional(),
    healthCheckUrl: z.string().optional(),
    healthCheckMethod: z.enum(["GET", "HEAD", "POST", "PUT"]).optional(),
    healthCheckInterval: z.string().optional(),
});

interface Props {
    open: boolean
    onClose: VoidFunction
}

export function AddProxyDialog({ open, onClose }: Props) {
    const addDomainMutation = useAddDomain()

    // Update the form to use the extended schema
    const form = useForm<z.infer<typeof extendedAddDomainSchema>>({
        resolver: zodResolver(extendedAddDomainSchema),
        defaultValues: {
            domain: '',
            enableRedirection: false,
            redirectTo: '',
            destinationAddress: '',
            port: '',
            enableHttps: true,
            enableAdvancedSettings: false,
            basicAuthUsername: '',
            basicAuthPassword: '',
            healthCheckUrl: '',
            healthCheckMethod: 'GET',
            healthCheckInterval: '30',
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
                processedValues.port = '0';
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

                                {/* Advanced settings section with accordions */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <FormField
                                        control={form.control}
                                        name="enableAdvancedSettings"
                                        render={({ field: { value, onChange, ...restField } }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <Checkbox checked={value} onCheckedChange={onChange} {...restField} />
                                                </FormControl>
                                                <FormLabel className="text-base font-semibold">Advanced Settings</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {form.watch('enableAdvancedSettings') && (
                                    <>
                                        <Accordion type="single" collapsible className="w-full">
                                            {/* Basic Authentication Accordion */}
                                            <AccordionItem value="basic-auth">
                                                <AccordionTrigger className="py-3">
                                                    <div className="flex items-center gap-2 text-sm font-medium">
                                                        <LockIcon className="h-4 w-4" />
                                                        Basic Authentication
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2 pb-4">
                                                    <div className="space-y-3">
                                                        <FormField
                                                            control={form.control}
                                                            name='basicAuthUsername'
                                                            render={({ field }) => (
                                                                <FormItem className='space-y-1'>
                                                                    <FormLabel>Username</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="Enter username" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name='basicAuthPassword'
                                                            render={({ field }) => (
                                                                <FormItem className='space-y-1'>
                                                                    <FormLabel>Password</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="password" placeholder="Enter password" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            {/* Health Check Accordion */}
                                            <AccordionItem value="health-check">
                                                <AccordionTrigger className="py-3">
                                                    <div className="flex items-center gap-2 text-sm font-medium">
                                                        <ActivityIcon className="h-4 w-4" />
                                                        Health Check Configuration
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2 pb-4">
                                                    <div className="space-y-4">
                                                        <p className="text-sm text-muted-foreground">
                                                            Configure health checks to monitor your proxy's status.
                                                            Health checks will be performed by our system periodically.
                                                        </p>
                                                        <FormField
                                                            control={form.control}
                                                            name='healthCheckUrl'
                                                            render={({ field }) => (
                                                                <FormItem className='space-y-1'>
                                                                    <FormLabel>Endpoint Path</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="Enter health check URL (e.g. /health)" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <FormField
                                                                control={form.control}
                                                                name='healthCheckMethod'
                                                                render={({ field }) => (
                                                                    <FormItem className='space-y-1'>
                                                                        <FormLabel>HTTP Method</FormLabel>
                                                                        <FormControl>
                                                                            <Select
                                                                                onValueChange={field.onChange}
                                                                                defaultValue={field.value}
                                                                            >
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Select HTTP method" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="GET">GET</SelectItem>
                                                                                    <SelectItem value="HEAD">HEAD</SelectItem>
                                                                                    <SelectItem value="POST">POST</SelectItem>
                                                                                    <SelectItem value="PUT">PUT</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name='healthCheckInterval'
                                                                render={({ field }) => (
                                                                    <FormItem className='space-y-1'>
                                                                        <FormLabel>Interval (seconds)</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                placeholder="30"
                                                                                {...field}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </>
                                )}

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
