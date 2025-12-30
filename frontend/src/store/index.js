import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: !!token });
      },

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(credentials);
          const { token, user } = response.data;
          console.log('Login response:', user.roles[0]);
          
          localStorage.setItem('token', token);
          set({ 
            token, 
            user, 
            role: user.roles[0],
            isAuthenticated: true,
            isLoading: false 
          });
          
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(userData);
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          set({ 
            token, 
            user, 
            role: user.roles[0],
            isAuthenticated: true,
            isLoading: false 
          });
          
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      fetchUser: async () => {
        try {
          const response = await authAPI.getMe();
          set({ user: response.data.user });
        } catch (error) {
          get().logout();
        }
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.roles?.includes(role) || false;
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.some(role => user?.roles?.includes(role)) || false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useHackathonStore = create((set) => ({
  hackathons: [],
  currentHackathon: null,
  myHackathons: [],
  myCoordinations: [],
  isLoading: false,

  setHackathons: (hackathons) => set({ hackathons }),
  setCurrentHackathon: (hackathon) => set({ currentHackathon: hackathon }),
  setMyHackathons: (hackathons) => set({ myHackathons: hackathons }),
  setMyCoordinations: (coordinations) => set({ myCoordinations: coordinations }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useTeamStore = create((set) => ({
  teams: [],
  myTeams: [],
  currentTeam: null,
  leaderboard: [],
  isLoading: false,

  setTeams: (teams) => set({ teams }),
  setMyTeams: (teams) => set({ myTeams: teams }),
  setCurrentTeam: (team) => set({ currentTeam: team }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useUIStore = create((set) => ({
  theme: 'light',
  sidebarOpen: true,
  
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
