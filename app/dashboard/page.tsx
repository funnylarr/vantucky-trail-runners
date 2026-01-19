import { LucideMap, LucideTrophy, LucideActivity, LucideChevronRight } from 'lucide-react'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import SyncButton from '@/components/SyncButton'

async function getProfile(athleteId: string) {
    const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('strava_athlete_id', athleteId)
        .single()
    return data
}

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const athleteId = cookieStore.get('strava_athlete_id')?.value

    const profile = athleteId ? await getProfile(athleteId) : null

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold mb-2 italic">Vantucky Trail Runners</h1>
                    <p className="text-gray-400">Tracking miles and cutoffs across Clark County.</p>
                </div>
                {profile && (
                    <div className="text-right">
                        <div className="text-sm text-gray-400 uppercase tracking-widest">Active Jorter</div>
                        <div className="text-xl font-bold text-denim">Runner #{athleteId}</div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-b-4 border-denim">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-denim/10 rounded-lg">
                            <LucideActivity className="w-6 h-6 text-denim" />
                        </div>
                        <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Unique Jort-Miles</h3>
                    </div>
                    <div className="text-3xl font-extrabold">{profile?.total_unique_miles?.toFixed(2) || '0.00'} <span className="text-sm font-normal text-gray-500">mi</span></div>
                    <div className="mt-2 text-xs text-green-500 font-medium">+0.0 this week</div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-unvisited/10 rounded-lg">
                            <LucideMap className="w-6 h-6 text-unvisited" />
                        </div>
                        <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">County Progress</h3>
                    </div>
                    <div className="text-3xl font-extrabold">0.0%</div>
                    <div className="mt-2 text-xs text-gray-500">Explore more to fill the map!</div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-visited/10 rounded-lg">
                            <LucideTrophy className="w-6 h-6 text-visited" />
                        </div>
                        <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Global Rank</h3>
                    </div>
                    <div className="text-3xl font-extrabold">N/A</div>
                    <div className="mt-2 text-xs text-gray-500">Sync activities to join the leaderboard</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <a href="/map" className="glass-card p-8 group hover:border-visited/50 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-visited/10 rounded-2xl group-hover:bg-visited/20 transition-colors">
                            <LucideMap className="w-10 h-10 text-visited" />
                        </div>
                        <LucideChevronRight className="w-6 h-6 text-gray-600 group-hover:text-visited transition-colors" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Trail Heatmap</h2>
                    <p className="text-gray-400">View your personalized heatmap of Clark County trails and find new paths to explore.</p>
                </a>

                <a href="/leaderboard" className="glass-card p-8 group hover:border-unvisited/50 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-unvisited/10 rounded-2xl group-hover:bg-unvisited/20 transition-colors">
                            <LucideTrophy className="w-10 h-10 text-unvisited" />
                        </div>
                        <LucideChevronRight className="w-6 h-6 text-gray-600 group-hover:text-unvisited transition-colors" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Club Leaderboard</h2>
                    <p className="text-gray-400">See how your unique mileage compares to other members in the running club.</p>
                </a>
            </div>

            <div className="glass-card p-8 text-center bg-gradient-to-b from-white/[0.02] to-transparent">
                <h2 className="text-xl font-bold mb-4">Ready for your next run?</h2>
                <p className="text-gray-400 mb-6">Your activities are automatically synced. Just run, and we'll do the rest.</p>
                <div className="flex justify-center gap-4">
                    <SyncButton />
                </div>
            </div>
        </div>
    )
}
