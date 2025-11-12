import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  membershipTier: 'free' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'incomplete';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  updateMembership: (tier: 'free' | 'pro' | 'enterprise', subscriptionData?: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: async () => {
        // Sign out from Supabase
        await supabase.auth.signOut();
        // Update local state
        set({ user: null, isAuthenticated: false });
      },
      updateProfile: async (profile) => {
        const { user } = get();
        if (!user) return;

        try {
          // Update the profile in Supabase
          const { error } = await supabase
            .from('profiles')
            .update({
              name: profile.name,
              // Add other fields as needed
            })
            .eq('id', user.id);

          if (error) throw error;

          // Update local state
          set({
            user: {
              ...user,
              ...profile,
            },
          });
        } catch (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
      },
      updateMembership: (tier, subscriptionData) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                membershipTier: tier,
                ...subscriptionData,
              }
            : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Helper function to fetch user profile
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (data) {
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        membershipTier: data.membership_tier,
        stripeCustomerId: data.stripe_customer_id,
        subscriptionId: data.subscription_id,
        subscriptionStatus: data.subscription_status,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    try {
      // Fetch user profile from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" error, which we handle below
        console.error('Error fetching profile:', error);
      }

      if (data) {
        // Profile exists, use it
        useAuthStore.getState().login({
          id: data.id,
          email: data.email,
          name: data.name,
          membershipTier: data.membership_tier,
          stripeCustomerId: data.stripe_customer_id,
          subscriptionId: data.subscription_id,
          subscriptionStatus: data.subscription_status,
        });
      } else {
        // Fallback to user metadata if profile doesn't exist yet
        const metadata = session.user.user_metadata;
        useAuthStore.getState().login({
          id: session.user.id,
          email: session.user.email || '',
          name: metadata?.name || session.user.email?.split('@')[0] || 'User',
          membershipTier: metadata?.membershipTier || 'free',
          stripeCustomerId: metadata?.stripeCustomerId,
          subscriptionId: metadata?.subscriptionId,
          subscriptionStatus: metadata?.subscriptionStatus,
        });
      }
    } catch (error) {
      console.error('Error in auth state change handler:', error);
    }
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.getState().logout();
  }
});


