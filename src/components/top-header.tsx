import { IconDrone } from "@tabler/icons-react"
import { Header } from "./header"
import Logout from "./logout"
import { useAuthStore } from "@/store/authStore"

const TopHeader = () => {
    const { user } = useAuthStore()
    return (
        <Header>
            <div className='flex items-center justify-between gap-4 w-full'>
                <div className="flex items-center justify-start gap-2">
                    <IconDrone stroke={1.25} />
                    <div className="text-lg font-bold text-gray-700">
                        Caddy Control
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <div>
                        Dashboard
                    </div>
                    <div>
                        API Keys
                    </div>
                    <div>
                        Docs
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                    {
                        user && (
                            <div>
                                Hello 👋, {user.username}
                            </div>
                        )
                    }
                    <Logout />
                </div>
            </div>
        </Header>
    )
}

export default TopHeader