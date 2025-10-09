import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiSlice } from '../apiSlice';
import { setCredentials, clearCredentials } from './authSlice';
import { AppDispatch } from '../store';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest extends LoginRequest {
  displayName: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ user: any; token: string }, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
    register: builder.mutation<{ user: any; token: string }, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {
          console.error('Registration failed:', error);
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch }) {
        dispatch(clearCredentials());
      },
    }),
    getMe: builder.query<{ user: any }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;

// Helper function to handle Firebase auth state changes
export const setupAuthStateListener = (dispatch: AppDispatch) => {
  return (user: any) => {
    if (user) {
      // User is signed in
      const { uid, email, displayName, photoURL } = user;
      dispatch(
        setCredentials({
          user: { id: uid, email, displayName, photoURL },
          token: (user as any).accessToken,
        })
      );
    } else {
      // User is signed out
      dispatch(clearCredentials());
    }
  };
};
