import { create } from 'zustand';
import { authApi, usersApi } from '../api';
import supabase from '../api/supabase';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        let profile = await usersApi.getProfile(session.user.id);
        
        // Ensure profile exists correctly
        try {
          if (!profile) {
            console.log('Profile missing for user, creating now...');
            const role = (session.user.email.toLowerCase() === 'kaththibala89@gmail.com' || session.user.email.toLowerCase() === 'admin@gmail.com') ? 'admin' : 'employee';
            profile = await usersApi.createProfile(session.user.id, {
              name: session.user.email.split('@')[0],
              email: session.user.email,
              role: role,
            });
          }
        } catch (profileErr) {
          console.error('Failed to create profile during init:', profileErr);
          // Don't set profile, which will fall back to login or session logout
        }
        
        set({
          user: session.user,
          profile,
          session,
          isAuthenticated: !!profile,
          isLoading: false,
        });
      } else {
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (err) {
      console.error('Initialization error:', err);
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  signIn: async (email, password) => {
    const data = await authApi.signIn({ email, password });
    let profile = await usersApi.getProfile(data.user.id);

    // If profile is missing (created manually in Auth), create it now
    if (!profile) {
      try {
        const role = (email.toLowerCase() === 'kaththibala89@gmail.com' || email.toLowerCase() === 'admin@gmail.com') ? 'admin' : 'employee';
        profile = await usersApi.createProfile(data.user.id, {
          name: email.split('@')[0],
          email: email.toLowerCase(),
          role: role,
        });
      } catch (profileErr) {
        console.error('Sign-in profile creation failed:', profileErr);
        throw new Error('Signed in to auth, but failed to link your profile to the database. Please contact your admin.');
      }
    }

    set({
      user: data.user,
      profile,
      session: data.session,
      isAuthenticated: true,
    });
    return profile;
  },

  signUp: async (name, email, password, role = 'employee') => {
    const data = await authApi.signUp({ name, email, password, role });
    if (data.user) {
      const profile = await usersApi.getProfile(data.user.id);
      set({
        user: data.user,
        profile,
        session: data.session,
        isAuthenticated: true,
      });
      return profile;
    }
  },

  signOut: async () => {
    await authApi.signOut();
    set({ user: null, profile: null, session: null, isAuthenticated: false });
  },

  updateProfile: async (updates) => {
    const { profile } = get();
    const updated = await usersApi.updateProfile(profile.id, updates);
    set({ profile: updated });
    return updated;
  },

  setProfile: (profile) => set({ profile }),
}));

export default useAuthStore;
