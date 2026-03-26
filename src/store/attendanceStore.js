import { create } from 'zustand';
import { attendanceApi } from '../api';
import supabase from '../api/supabase';

const useAttendanceStore = create((set, get) => ({
  todayRecord: null,
  history: [],
  allAttendance: [],
  todayStats: null,
  isLoading: false,
  isCheckedIn: false,
  isCheckedOut: false,

  fetchTodayAttendance: async (userId) => {
    try {
      set({ isLoading: true });
      const record = await attendanceApi.getTodayAttendance(userId);
      set({
        todayRecord: record,
        isCheckedIn: !!record?.check_in_time,
        isCheckedOut: !!record?.check_out_time,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  checkIn: async (userId, location) => {
    set({ isLoading: true });
    const record = await attendanceApi.checkIn({ userId, location });
    set({ todayRecord: record, isCheckedIn: true, isLoading: false });
    return record;
  },

  checkOut: async (userId) => {
    set({ isLoading: true });
    const record = await attendanceApi.checkOut({ userId });
    set({ todayRecord: record, isCheckedOut: true, isLoading: false });
    return record;
  },

  fetchHistory: async (userId, startDate, endDate) => {
    set({ isLoading: true });
    const data = await attendanceApi.getUserAttendance(userId, startDate, endDate);
    set({ history: data, isLoading: false });
    return data;
  },

  fetchAllAttendance: async (date) => {
    set({ isLoading: true });
    const data = await attendanceApi.getAllAttendance(date);
    set({ allAttendance: data, isLoading: false });
    return data;
  },

  fetchTodayStats: async () => {
    const data = await attendanceApi.getTodayStats();
    const stats = {
      present: data.length,
      checkedOut: data.filter((r) => r.check_out_time).length,
      absent: 0,
      records: data,
    };
    set({ todayStats: stats });
    return stats;
  },

  subscribeToAttendance: (userId) => {
    const channel = supabase
      .channel('attendance-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const updatedRecord = payload.new;
          set({
            todayRecord: updatedRecord,
            isCheckedIn: !!updatedRecord.check_in_time,
            isCheckedOut: !!updatedRecord.check_out_time,
          });
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
}));

export default useAttendanceStore;
