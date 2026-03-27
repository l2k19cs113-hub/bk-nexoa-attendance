import { create } from 'zustand';
import { reportsApi } from '../api';

const useReportsStore = create((set, get) => ({
  myReports: [],
  allReports: [],
  reportStats: null,
  isLoading: false,
  isSubmitting: false,

  fetchMyReports: async (userId) => {
    set({ isLoading: true });
    const data = await reportsApi.getUserReports(userId);
    set({ myReports: data, isLoading: false });
    return data;
  },

  fetchAllReports: async (statusFilter) => {
    set({ isLoading: true });
    const data = await reportsApi.getAllReports(statusFilter);
    set({ allReports: data, isLoading: false });
    return data;
  },

  submitReport: async (reportData) => {
    set({ isSubmitting: true });
    try {
      const result = await reportsApi.submitReport(reportData);
      const { myReports } = get();
      // result can be array (bulk) or single object
      const newEntries = Array.isArray(result) ? result : [result];
      set({ myReports: [...newEntries, ...myReports], isSubmitting: false });
      return result;
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  updateStatus: async (reportId, status) => {
    const updated = await reportsApi.updateReportStatus(reportId, status);
    const { allReports } = get();
    set({
      allReports: allReports.map((r) => (r.id === reportId ? updated : r)),
    });
    return updated;
  },

  fetchStats: async () => {
    const stats = await reportsApi.getReportStats();
    set({ reportStats: stats });
    return stats;
  },
}));

export default useReportsStore;
