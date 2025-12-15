import { NextResponse } from 'next/server'

const PSI_ENDPOINT =
  'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

type Strategy = 'mobile' | 'desktop'

async function runLighthouse(url: string, strategy: Strategy) {
  const params = new URLSearchParams({
    url,
    strategy,
    category: 'performance',
    key: process.env.PAGESPEED_API_KEY || ''
  })

  const response = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`PageSpeed API failed for ${strategy}`)
  }

  const json = await response.json()
  const audits = json.lighthouseResult.audits

  return {
    strategy,
    lcp: audits['largest-contentful-paint'].numericValue,
    tbt: audits['total-blocking-time'].numericValue,
    cls: audits['cumulative-layout-shift'].numericValue,
    speedIndex: audits['speed-index'].numericValue
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = body?.url

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const [mobile, desktop] = await Promise.all([
      runLighthouse(url, 'mobile'),
      runLighthouse(url, 'desktop')
    ])

    return NextResponse.json({
      url,
      results: {
        mobile,
        desktop
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}
