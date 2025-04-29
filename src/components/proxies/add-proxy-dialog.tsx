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
import { TransportVersion } from '@/app/api/_services/caddy/template-types'
import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

interface Props {
    open: boolean
    onClose: VoidFunction
}

export function AddProxyDialog({ open, onClose }: Props) {
    const addDomainMutation = useAddDomain()
    const [showAdvanced, setShowAdvanced] = useState(false)

    const form = useForm<AddDomainValues>({
        resolver: zodResolver(addDomainSchema),
        defaultValues: {
            domain: '',
            enableRedirection: false,
            redirectTo: '',
            destinationAddress: '',
            port: '',
            enableHttps: true,
            versions: undefined
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

    // Helper function to handle version checkbox changes
    const handleVersionChange = (version: TransportVersion, checked: boolean) => {
        const currentVersions = form.getValues('versions') || [];
        
        if (checked && !currentVersions.includes(version)) {
            // Add version
            form.setValue('versions', [...currentVersions, version]);
        } else if (!checked && currentVersions.includes(version)) {
            // Remove version
            form.setValue('versions', currentVersions.filter(v => v !== version));
        }
    };

    // List of available HTTP protocol versions
    const protocolVersions = [
        { value: 'h1', label: 'HTTP/1.1' },
        { value: 'h2', label: 'HTTP/2' },
        { value: 'h2c', label: 'HTTP/2 Cleartext' },
        { value: 'h3', label: 'HTTP/3' }
    ];

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

                                {/* Advanced Settings Toggle */}
                                <div 
                                    className="flex items-center justify-between cursor-pointer pt-2"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                >
                                    <h3 className="text-sm font-medium text-gray-700">Advanced Settings</h3>
                                    {showAdvanced ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
                                </div>

                                {/* Advanced Settings Content */}
                                {showAdvanced && (
                                    <div className="space-y-3 px-1 pt-1 pb-3 border-t">
                                        <div className="space-y-3">
                                            <FormLabel>HTTP Protocol Versions</FormLabel>
                                            <div className="grid grid-cols-2 gap-3">
                                                {protocolVersions.map((version) => {
                                                    const currentVersions = form.watch('versions') || [];
                                                    const isChecked = currentVersions.includes(version.value as TransportVersion);
                                                    
                                                    return (
                                                        <div key={version.value} className="flex items-center space-x-2">
                                                            <Checkbox 
                                                                id={`version-${version.value}`} 
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) => handleVersionChange(version.value as TransportVersion, !!checked)}
                                                            />
                                                            <label 
                                                                htmlFor={`version-${version.value}`}
                                                                className="text-sm font-medium cursor-pointer"
                                                            >
                                                                {version.label}
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Optional: Select HTTP protocol versions or leave empty to use server defaults
                                            </p>
                                        </div>
                                    </div>
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
