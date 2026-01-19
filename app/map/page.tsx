import MapView from '@/components/MapView'

async function getStats() {
    // Mock stats for the UI
    return {
        uniqueMiles: 42.5,
        countyCompletion: 1.2,
        rank: 12,
        recentActivity: 'Discovery Trail Run',
    }
}

export default async function MapPage() {
    const stats = await getStats()

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My County Map</h1>
                    <p className="text-gray-400">Viewing unique miles in Clark County, WA</p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-card px-6 py-4">
                        <div className="text-sm text-gray-400">Unique Miles</div>
                        <div className="text-2xl font-bold text-visited">{stats.uniqueMiles} mi</div>
                    </div>
                    <div className="glass-card px-6 py-4">
                        <div className="text-sm text-gray-400">Completion</div>
                        <div className="text-2xl font-bold text-unvisited">{stats.countyCompletion}%</div>
                    </div>
                </div>
            </div>

            <MapView />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Legend</h2>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-center gap-3">
                            <span className="w-4 h-1 bg-visited rounded-full" />
                            <span>Visited: Road segments you have traversed.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-4 h-1 bg-unvisited rounded-full" />
                            <span>Unexplored: Any valid road or trail in Clark County.</span>
                        </li>
                    </ul>
                </div>

                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <button className="flex-1 strava-button px-4 py-3 rounded-xl font-semibold">
                            Sync Latest Runs
                        </button>
                        <button className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl font-semibold transition-colors">
                            Share Map
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
