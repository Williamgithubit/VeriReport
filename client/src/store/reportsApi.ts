import { apiSlice } from './apiSlice';

export interface Report {
  id: string;
  studentId?: string;
  studentName: string;
  class: string;
  year: number | null;
  status: 'Passed' | 'Failed' | 'Passed Under Condition' | 'Summer School' | 'Pending' | 'Valid' | 'Invalid';
  verificationStatus?: 'Valid' | 'Pending' | 'Invalid';
  verificationId: string;
  fileUrl?: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ReportsResponse {
  reports: Report[];
  total: number;
  pending: number;
}

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<ReportsResponse, void>({
      query: () => ({ url: '/reports', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              { type: 'Report' as const, id: 'LIST' },
              ...result.reports.map((r) => ({ type: 'Report' as const, id: r.id })),
            ]
          : [{ type: 'Report' as const, id: 'LIST' }],
    }),

    updateReport: builder.mutation<
      { success: true },
      {
        id: string;
        studentName: string;
        class: string;
        year: number | null;
        status: Report['status'];
        verificationStatus?: NonNullable<Report['verificationStatus']>;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/reports/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Report', id: 'LIST' },
        { type: 'Report', id: arg.id },
      ],
    }),

    deleteReport: builder.mutation<{ success: true }, { id: string }>({
      query: ({ id }) => ({
        url: `/reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Report', id: 'LIST' },
        { type: 'Report', id: arg.id },
      ],
    }),
  }),
});

export const { useGetReportsQuery, useUpdateReportMutation, useDeleteReportMutation } = reportsApi;
