import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

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

        // 2. Identify or Create User
        // We look for a profile with this Strava ID
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('strava_athlete_id', athleteId)
            .single()

        let userId: string

        if (profile) {
            userId = profile.id
        } else {
            // Create a "shadow" user in auth.users
            // In a real app, you'd ask for an email, but for a prototype 
            // we'll use a placeholder email based on the athlete ID.
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: `strava_${athleteId}@vantucky.club`,
                password: Math.random().toString(36).slice(-12),
                email_confirm: true,
                user_metadata: { firstname, lastname, strava_id: athleteId }
            })

            if (createError) {
                console.error('Error creating shadow user:', createError)
                return NextResponse.redirect(new URL('/?auth_error=user_creation_failed', request.url))
            }
            userId = newUser.user.id
        }

        // 3. Upsert Profile with tokens
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                strava_athlete_id: athleteId,
                strava_access_token: access_token,
                strava_refresh_token: refresh_token,
                strava_token_expires_at: expires_at,
                last_sync_at: new Date().toISOString(),
            })

        if (profileError) {
            console.error('Error updating profile:', profileError)
            return NextResponse.redirect(new URL('/?auth_error=db_error', request.url))
        }

        // 4. Set session cookie for the prototype
        // In a real app we'd use proper Supabase session management
        const cookieStore = await cookies()
        cookieStore.set('strava_athlete_id', athleteId.toString(), {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })

        return NextResponse.redirect(new URL('/dashboard?auth_success=true', request.url))
    } catch (err) {
        console.error('OAuth Callback Error:', err)
        return NextResponse.redirect(new URL('/?auth_error=internal_server_error', request.url))
    }
}
