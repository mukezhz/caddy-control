import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

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
}: Props) => {
    return (
        <Dialog open={open}>
            <DialogContent className={
                cn(hideCloseIcon && "[&>button]:hidden")
            }>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type='submit' form='tag-form'>
                        Change Password
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    )
}

export default ChangePassword