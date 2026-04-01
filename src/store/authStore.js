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
        const email = session.user.email.toLowerCase();
        const isAdminEmail = (
          email === 'l2k19cs113@nmc.ac.in' || 
          email === 'kaththibala89@gmail.com' || 
          email === 'admin@gmail.com'
        );

        // Force upgrade to admin if it's an admin email but role is 'employee'
        if (profile && isAdminEmail && profile.role !== 'admin') {
          console.log('Upgrading profile to admin role...');
          profile = await usersApi.updateProfile(session.user.id, { role: 'admin' });
        }
        
        // Ensure profile exists correctly
        try {
          if (!profile) {
            console.log('Profile missing for user, creating now...');
            const role = isAdminEmail ? 'admin' : 'employee';
            profile = await usersApi.createProfile(session.user.id, {
              name: session.user.email.split('@')[0],
              email: email,
              role: role,
            });
          }
        } catch (profileErr) {
          console.error('Failed to create profile during init:', profileErr);
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
    const data = await authApi.signIn({ email: email.trim(), password });
    
    let profile = null;
    try {
      profile = await usersApi.getProfile(data.user.id);
    } catch (e) {
      console.log('Get profile failed during sign in:', e);
    }

    if (!profile) {
      try {
        const emailLower = email.toLowerCase();
        const isAdminEmail = (
          emailLower === 'l2k19cs113@nmc.ac.in' || 
          emailLower === 'kaththibala89@gmail.com' || 
          emailLower === 'admin@gmail.com'
        );
        const role = isAdminEmail ? 'admin' : 'employee';
        profile = await usersApi.createProfile(data.user.id, {
          name: email.split('@')[0],
          email: emailLower,
          role: role,
        });
      } catch (profileErr) {
        throw new Error('Signed in, but failed to load your database profile.');
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
