import '../styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Vantucky Trail Runners',
    description: 'Track your unique trail miles with the Vantucky Trail Runners in Clark County, WA.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <nav className="fixed top-0 w-full z-50 glass-card px-6 py-4 flex justify-between items-center m-4 max-w-[calc(100%-2rem)]">
                    <div className="text-xl font-bold bg-gradient-to-r from-denim to-strava bg-clip-text text-transparent italic tracking-tight">
                        VANTUCKY TRAIL RUNNERS
                    </div>
                    <div className="flex gap-6 items-center">
                        <a href="/map" className="hover:text-visited transition-colors">Map</a>
                        <a href="/leaderboard" className="hover:text-visited transition-colors">Leaderboard</a>
                        <a href="/api/auth/strava" className="strava-button px-4 py-2 rounded-full font-semibold text-sm">
                            Connect Strava
                        </a>
                    </div>
                </nav>
                <main className="pt-24 px-6 min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    )
}
