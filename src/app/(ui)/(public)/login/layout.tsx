"use client";

interface Props {
    children: React.ReactNode
}

export default function SetupLayout({ children }: Props) {
    return (
        <div className='container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8'>
                <div className='mb-4 flex items-center justify-center gap-2'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-drone"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 10h4v4h-4z" /><path d="M10 10l-3.5 -3.5" /><path d="M9.96 6a3.5 3.5 0 1 0 -3.96 3.96" /><path d="M14 10l3.5 -3.5" /><path d="M18 9.96a3.5 3.5 0 1 0 -3.96 -3.96" /><path d="M14 14l3.5 3.5" /><path d="M14.04 18a3.5 3.5 0 1 0 3.96 -3.96" /><path d="M10 14l-3.5 3.5" /><path d="M6 14.04a3.5 3.5 0 1 0 3.96 3.96" /></svg>
                    <h1 className='text-xl font-medium'>Caddy Control</h1>
                </div>
                {children}
            </div>
        </div>
    )
}
