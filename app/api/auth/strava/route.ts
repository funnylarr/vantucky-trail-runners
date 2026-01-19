import { NextResponse } from 'next/server'

export async function GET() {
    const clientId = process.env.STRAVA_CLIENT_ID
    const redirectUri = process.env.STRAVA_REDIRECT_URI
    const scope = 'read,activity:read_all'

    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&approval_prompt=force`

    return NextResponse.redirect(authUrl)
}
