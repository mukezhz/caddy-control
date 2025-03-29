import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { PasswordInput } from '../password-input'
import { PasswordChangeData, PasswordChangeSchema } from '@/schemas/user/auth.schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useChangePassword } from '@/hooks/user/user.hooks'

interface Props {
    title: string
    description: string
    hideCloseIcon?: boolean
    open: boolean
    onClose: VoidFunction
}

const ChangePassword = ({
    title,
    description,
    hideCloseIcon = false,
    open,
    onClose
}: Props) => {
    const changePasswordMutation = useChangePassword()
    const form = useForm<PasswordChangeData>({
        resolver: zodResolver(PasswordChangeSchema),
        defaultValues: {
            password: '',
            confirmPassword: ''
        },
    })

    const onSubmit = async (data: PasswordChangeData) => {
        await changePasswordMutation.mutateAsync(data);
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={() => { onClose() }}>
            <DialogContent className={
                cn(hideCloseIcon && "[&>button]:hidden")
            }>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className='grid gap-2'>
                                <FormField
                                    control={form.control}
                                    name='password'
                                    render={({ field }) => (
                                        <FormItem className='space-y-1'>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <PasswordInput placeholder='Enter new password' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='confirmPassword'
                                    render={({ field }) => (
                                        <FormItem className='space-y-1'>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <PasswordInput placeholder='Confirm New Password' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button className='mt-2 cursor-pointer' disabled={false}>
                                    Change Password
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>

    )
}

export default ChangePassword