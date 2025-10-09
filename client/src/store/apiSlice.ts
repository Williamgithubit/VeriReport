import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';

// Define a base query with the base URL
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  prepareHeaders: (headers, { getState }) => {
    // Get the token from the auth state
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Report'], // Define tag types for cache invalidation
  endpoints: () => ({}), // Endpoints are injected from other slices
});

// Export hooks for usage in functional components
export const { 
  middleware, 
  reducer: apiReducer,
  reducerPath: apiReducerPath,
  util: { updateQueryData, invalidateTags },
} = apiSlice;

// Export the enhanced API with injected endpoints
export const enhancedApi = apiSlice.enhanceEndpoints({
  addTagTypes: ['User', 'Report'],
  endpoints: () => ({}),
});