import client from './client'

export type EntityType = 'city' | 'country' | 'hotel' | 'poi' | 'trip'

export interface ReviewPayload {
  entityType: EntityType
  entityId: number | string
  rating: number
  comment?: string
}

export const reviewsApi = {
  addReview: async (payload: ReviewPayload, token?: string) => {
    const res = await client.post(
      '/reviews',
      payload,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    )
    return res.data
  },

  // GET reviews for an entity: /reviews/:type/:id?page=&limit=
  getReviewsForEntity: async (
    entityType: EntityType,
    entityId: number | string,
    page = 1,
    limit = 20,
    token?: string
  ) => {
    const res = await client.get(`/reviews/${entityType}/${entityId}`, {
      params: { page, limit },
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    })
    return res.data
  },
}


