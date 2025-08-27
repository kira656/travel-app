import client from './client'

export type EntityType = 'city' | 'country' | 'hotel' | 'poi' | 'trip'

export interface FavouritePayload {
  entityType: EntityType
  entityId: number | string
}

export const favouritesApi = {
  addFavourite: async (payload: FavouritePayload, token?: string) => {
    const res = await client.post(
      '/favourites',
      payload,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    )
    return res.data
  },

  // GET favourites for an entity: /favourites/:type/:id?page=&limit=
  getFavouritesForEntity: async (
    entityType: EntityType,
    entityId: number | string,
    page = 1,
    limit = 20,
    token?: string
  ) => {
    const res = await client.get(`/favourites/${entityType}/${entityId}`, {
      params: { page, limit },
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    })
    return res.data
  },
  // Remove favourite: DELETE /favourites with body { entityType, entityId }
  removeFavourite: async (payload: FavouritePayload, token?: string) => {
    const res = await client.delete('/favourites', {
      data: payload,
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    })
    return res.data
  },
  // Get current user's favourites: GET /favourites/me
  getMyFavourites: async (token?: string) => {
    const res = await client.get('/favourites/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
    return res.data
  },
}


