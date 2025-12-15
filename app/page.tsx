'use client'

import { useState } from 'react'

type Metrics = {
  lcp: number
  tbt: number
  cls: number
  speedIndex: number
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<{
    mobile: Metrics
    desktop: Metrics
  } | null>(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/lighthouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error)
      }

      setResults(json.results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderCard = (title: string, data: Metrics) => (
    <div className="col-md-6">
      <div className="card mb-4">
        <div className="card-header fw-bold">{title}</div>
        <table className="table mb-0">
          <tbody>
            <tr>
              <th>LCP (ms)</th>
              <td>{Math.round(data.lcp)}</td>
            </tr>
            <tr>
              <th>Total Blocking Time (ms)</th>
              <td>{Math.round(data.tbt)}</td>
            </tr>
            <tr>
              <th>CLS</th>
              <td>{data.cls.toFixed(3)}</td>
            </tr>
            <tr>
              <th>Speed Index</th>
              <td>{Math.round(data.speedIndex)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <main className="container py-5">
      <h1 className="mb-4">Lighthouse Lab Metrics</h1>

      <div className="input-group mb-4">
        <input
          type="url"
          className="form-control"
          placeholder="https://example.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={runTest}
          disabled={loading}
        >
          {loading ? 'Running…' : 'Run Test'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {results && (
        <div className="row">
          {renderCard('Mobile', results.mobile)}
          {renderCard('Desktop', results.desktop)}
        </div>
      )}
    </main>
  )
}
