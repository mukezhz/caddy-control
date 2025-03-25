import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/user/user.hooks"
import { useAuthStore } from "@/store/authStore"

export default function Logout() {
    const handleLogout = useLogout()
    return (
        <Button onClick={handleLogout} variant="outline" className="inline-flex items-center space-x-2 cursor-pointer">
            <LogOutIcon />
            <span>Logout</span>
        </Button>
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