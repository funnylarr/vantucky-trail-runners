export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-extrabold mb-6 tracking-tight">
                Every Mile is a <span className="text-visited">New Adventure.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                Join the <span className="text-denim font-bold">Vantucky Trail Runners</span> and track every unique mile of trails you run in Clark County.
                Jorts optional, but highly encouraged.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                <div className="glass-card p-6 text-left">
                    <div className="w-12 h-12 bg-visited/20 rounded-lg flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-visited" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Track Uniques</h3>
                    <p className="text-sm text-gray-400">Mark every new segment of road or trail in Clark County as you run it.</p>
                </div>

                <div className="glass-card p-6 text-left">
                    <div className="w-12 h-12 bg-strava/20 rounded-lg flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-strava" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Strava Sync</h3>
                    <p className="text-sm text-gray-400">Automatically import your activities and update your progress instantly.</p>
                </div>

                <div className="glass-card p-6 text-left">
                    <div className="w-12 h-12 bg-unvisited/20 rounded-lg flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-unvisited" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Leaderboard</h3>
                    <p className="text-sm text-gray-400">See how you stack up against other club members in the county.</p>
                </div>
            </div>

            <a href="/api/auth/strava" className="strava-button px-8 py-4 rounded-full font-bold text-lg inline-block">
                Log In With Strava
            </a>
        </div>
    )
}
