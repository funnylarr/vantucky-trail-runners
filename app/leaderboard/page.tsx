import { LucideTrophy, LucideTrendingUp, LucideMedal } from 'lucide-react'

async function getLeaderboard() {
    // Mock data for the leaderboard
    return [
        { id: 1, name: 'Alex Honnold', miles: 1254.2, completion: 32.4, level: 'Legend' },
        { id: 2, name: 'Courtney Dauwalter', miles: 1102.8, completion: 28.1, level: 'Pro' },
        { id: 3, name: 'Jim Walmsley', miles: 985.4, completion: 25.4, level: 'Pro' },
        { id: 4, name: 'Kilian Jornet', miles: 842.1, completion: 21.8, level: 'Expert' },
        { id: 5, name: 'Des Linden', miles: 654.5, completion: 15.2, level: 'Advanced' },
    ]
}

export default async function LeaderboardPage() {
    const leaders = await getLeaderboard()

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-visited/10 rounded-2xl">
                    <LucideTrophy className="w-10 h-10 text-visited" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold">Club Leaderboard</h1>
                    <p className="text-gray-400">Top runners exploring Clark County, WA</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leaders.slice(0, 3).map((leader, i) => (
                    <div key={leader.id} className="glass-card p-6 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <LucideMedal className="w-24 h-24" />
                        </div>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Rank #{i + 1}</div>
                        <div className="text-2xl font-extrabold mb-1">{leader.name}</div>
                        <div className="text-visited font-bold text-lg">{leader.miles} mi</div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                            <LucideTrendingUp className="w-4 h-4 text-green-500" />
                            {leader.completion}% of County
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 uppercase text-xs font-bold tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Member</th>
                            <th className="px-6 py-4 text-right">Unique Miles</th>
                            <th className="px-6 py-4 text-right">Completion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {leaders.map((leader, i) => (
                            <tr key={leader.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 font-bold text-gray-400">#{i + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold group-hover:text-visited transition-colors">{leader.name}</span>
                                        <span className="text-xs text-gray-500">{leader.level}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">{leader.miles}</td>
                                <td className="px-6 py-4 text-right text-gray-400">{leader.completion}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
