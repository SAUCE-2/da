import createClient, { type Middleware } from 'openapi-fetch'

import type { paths } from './api-schema'

const client = createClient<paths>({ baseUrl: '' })

function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Request failed.'
  }

  const record = error as Record<string, unknown>

  if (typeof record.detail === 'string' && record.detail.length > 0) {
    return record.detail
  }

  if (typeof record.message === 'string' && record.message.length > 0) {
    return record.message
  }

  if (typeof record.title === 'string' && record.title.length > 0) {
    return record.title
  }

  if (typeof record.error === 'string' && record.error.length > 0) {
    return record.error
  }

  return 'Request failed.'
}

const errorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (response.ok) {
      return undefined
    }

    let body: unknown
    try {
      body = await response.clone().json()
    } catch {
      throw new Error(`Request failed with status ${response.status}.`)
    }

    throw new Error(getErrorMessage(body))
  },
}

client.use(errorMiddleware)

function unwrapData<T>(data: T | undefined): T {
  if (data === undefined) {
    throw new Error('Request failed.')
  }

  return data
}

export function listQueries() {
  return client.GET('/api/queries').then(({ data }) => unwrapData(data))
}

export function createQuery(
  request: NonNullable<
    paths['/api/queries']['post']['requestBody']
  >['content']['application/json'],
) {
  return client
    .POST('/api/queries', { body: request })
    .then(({ data }) => unwrapData(data))
}

export function updateQuery(
  id: number,
  request: NonNullable<
    paths['/api/queries/{id}']['put']['requestBody']
  >['content']['application/json'],
) {
  return client
    .PUT('/api/queries/{id}', { params: { path: { id } }, body: request })
    .then(({ data }) => unwrapData(data))
}

export function deleteQuery(id: number) {
  return client
    .DELETE('/api/queries/{id}', { params: { path: { id } } })
    .then(() => undefined)
}

export function previewQuery(
  id: number,
  request: NonNullable<
    paths['/api/queries/{id}/preview']['post']['requestBody']
  >['content']['application/json'] = {},
) {
  return client
    .POST('/api/queries/{id}/preview', {
      params: { path: { id } },
      body: request,
    })
    .then(({ data }) => unwrapData(data))
}

export function listCategories() {
  return client.GET('/api/categories').then(({ data }) => unwrapData(data))
}

export function createCategory(
  request: NonNullable<
    paths['/api/categories']['post']['requestBody']
  >['content']['application/json'],
) {
  return client
    .POST('/api/categories', { body: request })
    .then(({ data }) => unwrapData(data))
}

export function updateCategory(
  id: number,
  request: NonNullable<
    paths['/api/categories/{id}']['put']['requestBody']
  >['content']['application/json'],
) {
  return client
    .PUT('/api/categories/{id}', { params: { path: { id } }, body: request })
    .then(({ data }) => unwrapData(data))
}

export function deleteCategory(id: number) {
  return client
    .DELETE('/api/categories/{id}', { params: { path: { id } } })
    .then(() => undefined)
}

export function listPlans() {
  return client.GET('/api/plans').then(({ data }) => unwrapData(data))
}

export function createPlan(
  request: NonNullable<
    paths['/api/plans']['post']['requestBody']
  >['content']['application/json'],
) {
  return client
    .POST('/api/plans', { body: request })
    .then(({ data }) => unwrapData(data))
}

export function updatePlan(
  id: number,
  request: NonNullable<
    paths['/api/plans/{id}']['put']['requestBody']
  >['content']['application/json'],
) {
  return client
    .PUT('/api/plans/{id}', { params: { path: { id } }, body: request })
    .then(({ data }) => unwrapData(data))
}

export function deletePlan(id: number) {
  return client
    .DELETE('/api/plans/{id}', { params: { path: { id } } })
    .then(() => undefined)
}
