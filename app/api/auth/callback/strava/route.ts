import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
        return NextResponse.redirect(new URL('/?auth_error=strava_rejected', request.url))
    }

    try {
        // 1. Exchange code for tokens
        const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.STRAVA_CLIENT_ID,
                client_secret: process.env.STRAVA_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Strava token exchange failed:', data)
            return NextResponse.redirect(new URL('/?auth_error=exchange_failed', request.url))
        }

        const {
            access_token,
            refresh_token,
            expires_at,
            athlete: { id: athleteId, firstname, lastname },
        } = data

        // 2. Update Supabase profile
        // Note: In a real app, we'd use the authenticated user's ID. 
        // For now, we'll upsert based on athlete ID or session.
        // If user is not logged into Supabase, we might need a separate flow or 
        // link the Strava account to the current Supabase session.

        // For this prototype, let's assume the user is already logged in to Supabase
        // or we'll create/update based on athleteId directly if we want a Strava-first auth.

        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    strava_athlete_id: athleteId,
                    strava_access_token: access_token,
                    strava_refresh_token: refresh_token,
                    strava_token_expires_at: expires_at,
                    last_sync_at: new Date().toISOString(), // Optional: mark as synced
                })

            if (profileError) {
                console.error('Error updating profile:', profileError)
                return NextResponse.redirect(new URL('/?auth_error=db_error', request.url))
            }
        }

        return NextResponse.redirect(new URL('/dashboard?auth_success=true', request.url))
    } catch (err) {
        console.error('OAuth Callback Error:', err)
        return NextResponse.redirect(new URL('/?auth_error=internal_server_error', request.url))
    }
}
