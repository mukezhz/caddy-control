import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/hooks/user/user.hooks'
import { getInitialsForAvatar } from '@/lib/utils'
import { useAuthStore, hasPermission } from '@/store/authStore'
import { IconPassword, IconSettings } from '@tabler/icons-react'
import Link from 'next/link'

type Props = {
  openPasswordDialog: () => void
}

export function ProfileDropdown({
  openPasswordDialog,
}: Props) {
  const logOut = useLogout()
  const { user } = useAuthStore()
  const nameInitials = getInitialsForAvatar(user?.username || 'xo')

  // Check if user has access to settings (admin or has system:manage permission)
  const hasSettingsAccess = user?.isAdmin || hasPermission('system:manage')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='default' className='relative h-10 w-10 bg-gray-300 rounded-full text-gray-700 cursor-pointer'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback>{nameInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>👋 Hello, {user?.username}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {hasSettingsAccess && (
            <Link href="/settings" passHref>
              <DropdownMenuItem className='flex items-center justify-between'>
                <span>Settings</span>
                <IconSettings size={16} />
              </DropdownMenuItem>
            </Link>
          )}
          <DropdownMenuItem className='flex items-center justify-between' onClick={openPasswordDialog}>
            <span>Change password</span>
            <IconPassword />
          </DropdownMenuItem>
          <DropdownMenuItem className='flex items-center justify-between' onClick={logOut}>
            <span>Logout</span>
            <LogOutIcon />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LogOutIcon() {
  return (
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}