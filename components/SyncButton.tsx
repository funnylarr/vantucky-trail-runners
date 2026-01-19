'use client'

import { useState } from 'react'
import { LucideRefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SyncButton() {
    const [isSyncing, setIsSyncing] = useState(false)
    const router = useRouter()

    const handleSync = async () => {
        setIsSyncing(true)
        try {
            const res = await fetch('/api/sync', { method: 'POST' })
            const data = await res.json()

            if (res.ok) {
                alert(`Sync Complete! Processed ${data.processedCount} new runs. Your total is now ${data.totalMiles.toFixed(2)} miles.`)
                router.refresh()
            } else {
                alert(`Sync Failed: ${data.error}`)
            }
        } catch (err) {
            alert('Something went wrong during sync.')
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`strava-button px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <LucideRefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing Jort-Miles...' : 'Sync Latest Runs'}
        </button>
    )
}
