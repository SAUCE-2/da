import { queryOptions } from '@tanstack/react-query'

type HealthResponse = {
  status?: string
}

async function getBackendHealth() {
  const response = await fetch('/api/health')

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`)
  }

  return response.json() as Promise<HealthResponse>
}

export const healthQueryOptions = () =>
  queryOptions({
    queryKey: ['health'] as const,
    queryFn: getBackendHealth,
    staleTime: 30_000,
  })
