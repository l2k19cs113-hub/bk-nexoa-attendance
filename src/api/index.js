import supabase from './supabase';

// ─── AUTH API ────────────────────────────────────────────────────────────────

export const authApi = {
  signUp: async ({ email, password, name, role = 'employee' }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        name,
        email,
        role,
      });
      if (profileError) throw profileError;
    }
    return data;
  },

  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
};

// ─── USERS API ───────────────────────────────────────────────────────────────

export const usersApi = {
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  createProfile: async (userId, profileData) => {
    const { data, error } = await supabase
      .from('users')
      .insert({ id: userId, ...profileData })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getAllEmployees: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'employee')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  deleteEmployee: async (userId) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
  },

  uploadAvatar: async (userId, fileUri, fileType) => {
    const fileName = `${userId}/avatar.${fileType.split('/')[1]}`;
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const { error } = await supabase.storage.from('avatars').upload(fileName, blob, {
      contentType: fileType,
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  },
};

// ─── ATTENDANCE API ───────────────────────────────────────────────────────────

export const attendanceApi = {
  checkIn: async ({ userId, location }) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check if already checked in today
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) throw new Error('Already checked in today');

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        date: today,
        check_in_time: now,
        location: location ? `${location.latitude},${location.longitude}` : null,
        check_in_address: location?.address || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  checkOut: async ({ userId }) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out_time: now })
      .eq('user_id', userId)
      .eq('date', today)
      .is('check_out_time', null)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getTodayAttendance: async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance')
      .select('*, users(name, email)')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  getUserAttendance: async (userId, startDate, endDate) => {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getAllAttendance: async (date) => {
    let query = supabase
      .from('attendance')
      .select('*, users(name, email, role)')
      .order('check_in_time', { ascending: false });

    if (date) query = query.eq('date', date);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getTodayStats: async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance')
      .select('*, users(name)')
      .eq('date', today);

    if (error) throw error;
    return data;
  },

  getMonthlyData: async (userId, year, month) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return data;
  },
};

// ─── REPORTS API ─────────────────────────────────────────────────────────────

export const reportsApi = {
  submitReport: async ({ userId, title, description, fileUri, fileType }) => {
    const today = new Date().toISOString().split('T')[0];
    let fileUrl = null;

    if (fileUri) {
      const fileName = `${userId}/${today}_${Date.now()}.${fileType?.split('/')[1] || 'jpg'}`;
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage
        .from('report-files')
        .upload(fileName, blob, { contentType: fileType, upsert: false });

      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('report-files').getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        date: today,
        title,
        description,
        file_url: fileUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getUserReports: async (userId) => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  getAllReports: async (status) => {
    let query = supabase
      .from('reports')
      .select('*, users(name, email)')
      .order('date', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  updateReportStatus: async (reportId, status) => {
    const { data, error } = await supabase
      .from('reports')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getReportStats: async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('status');

    if (error) throw error;
    const stats = { total: data.length, pending: 0, approved: 0, rejected: 0 };
    data.forEach((r) => { stats[r.status] = (stats[r.status] || 0) + 1; });
    return stats;
  },
};
