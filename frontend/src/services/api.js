import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.data?.message) {
      // Don't show toast here, let the component handle it
      console.error('API Error:', error.response.data.message);
    } else if (error.message) {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  searchUsers: (params) => api.get('/auth/search', { params }),
  getNotifications: () => api.get('/auth/notifications'),
  markNotificationRead: (id) => api.put(`/auth/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/auth/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/auth/notifications/${id}`),
};

// Hackathon API
export const hackathonAPI = {
  getAll: (params) => api.get('/hackathons', { params }),
  getById: (id) => api.get(`/hackathons/${id}`),
  create: (data) => api.post('/hackathons', data),
  update: (id, data) => api.put(`/hackathons/${id}`, data),
  delete: (id) => api.delete(`/hackathons/${id}`),
  getMyHackathons: () => api.get('/hackathons/my/organized'),
  getMyCoordinations: () => api.get('/hackathons/my/coordinations'),
  getCoordinatorInvitations: () => api.get('/hackathons/coordinator-invitations'),
  
  
  // NEW: Coordinator management functions
  getCoordinators: (id) => api.get(`/hackathons/${id}/coordinators`),
  removeCoordinator: (id, userId) => api.delete(`/hackathons/${id}/coordinators/${userId}`),
  cancelCoordinatorInvite: (id, userId) => api.delete(`/hackathons/${id}/coordinators/${userId}/cancel`),
  resendCoordinatorInvite: (id, userId) => api.post(`/hackathons/${id}/coordinators/${userId}/resend`),
  acceptCoordinatorInvitation: (hackathonId) => api.post(`/hackathons/coordinators/accept`, { hackathonId }),
  
  declineCoordinatorInvitation: (id) => api.post(`/hackathons/coordinators/decline/${id}`),
  updateCoordinatorPermissions: (hackathonId, userId, data) => 
    api.put(`/hackathons/${hackathonId}/coordinators/${userId}/permissions`, data),
  
  // Judge management
  inviteJudge: (id, data) => api.post(`/hackathons/${id}/judges/invite`, data),
  acceptJudgeInvitation: (token, data) => api.post(`/hackathons/judges/accept/${token}`, data),
  
  // Analytics
  getAnalytics: (id, params) => api.get(`/hackathons/${id}/analytics`, { params }),
  exportAnalytics: (id) => api.get(`/hackathons/${id}/analytics/export`, { responseType: 'blob' }),
};

// Team API
export const teamAPI = {
  // Basic CRUD
  create: (data) => api.post('/teams', data),
  register: (data) => api.post('/teams/register', data),
  getByHackathon: (hackathonId, params) => api.get(`/teams/hackathon/${hackathonId}`, { params }),
  getById: (id) => api.get(`/teams/${id}`),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  getMyTeams: () => api.get('/teams/my'),
  
  // Check if user is registered for a hackathon
  getUserTeamForHackathon: (hackathonId) => api.get(`/teams/my/hackathon/${hackathonId}`),
  
  // Team Management
  checkIn: (id) => api.post(`/teams/${id}/checkin`),
  checkInMember: (teamId, memberId) => api.post(`/teams/${teamId}/members/${memberId}/checkin`),
  assign: (id, data) => api.put(`/teams/${id}/assign`, data),
  submit: (id, data) => api.post(`/teams/${id}/submit`, data),
  score: (id, data) => api.post(`/teams/${id}/score`, data),
  eliminate: (id, data) => api.post(`/teams/${id}/eliminate`, data),
  getLeaderboard: (hackathonId, params) => api.get(`/teams/hackathon/${hackathonId}/leaderboard`, { params }),
  
  // Team Confirmation
  confirmTeam: (teamId) => api.post(`/teams/${teamId}/confirm`),
  
  // Organizer - Team Approval
  getSubmittedTeams: (hackathonId) => api.get(`/teams/hackathon/${hackathonId}/submitted`),
  approveTeam: (teamId) => api.post(`/teams/${teamId}/approve`),
  rejectTeam: (teamId, data) => api.post(`/teams/${teamId}/reject`, data),
  bulkApproveTeams: (hackathonId, teamIds) => api.post(`/teams/hackathon/${hackathonId}/bulk-approve`, { teamIds }),
  bulkRejectTeams: (hackathonId, teamIds, reason) => api.post(`/teams/hackathon/${hackathonId}/bulk-reject`, { teamIds, reason }),
  exportTeamsToCSV: (hackathonId, status) => api.get(`/teams/hackathon/${hackathonId}/export`, { params: { status }, responseType: 'blob' }),
  
  // Team Notes
  addNoteToTeam: (teamId, data) => api.post(`/teams/${teamId}/notes`, data),
  getTeamNotes: (teamId) => api.get(`/teams/${teamId}/notes`),
  
  // Auto-approval
  checkAutoApproval: (teamId) => api.post(`/teams/${teamId}/check-auto-approval`),
  
  // Join Requests (New)
  sendJoinRequest: (teamId, data) => api.post(`/teams/${teamId}/join-requests`, data),
  getJoinRequests: (teamId) => api.get(`/teams/${teamId}/join-requests`),
  getPendingMembers: (teamId) => api.get(`/teams/${teamId}/pending-members`),
  getMyJoinRequests: () => api.get('/teams/my/join-requests'),
  acceptJoinRequest: (teamId, requestId) => api.post(`/teams/${teamId}/join-requests/${requestId}/accept`),
  rejectJoinRequest: (teamId, requestId, data) => api.post(`/teams/${teamId}/join-requests/${requestId}/reject`, data),
  cancelJoinRequest: (teamId, requestId) => api.delete(`/teams/${teamId}/join-requests/${requestId}`),
  
  // Member Management
  searchUsersForTeam: (hackathonId, query, teamId) => api.get(`/teams/hackathon/${hackathonId}/search-users`, { params: { query, teamId } }),
  inviteMember: (id, data) => api.post(`/teams/${id}/invite`, data),
  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  leaveTeam: (teamId) => api.post(`/teams/${teamId}/leave`),
  transferLeadership: (teamId, memberId) => api.put(`/teams/${teamId}/transfer-leadership`, { newLeader: memberId }),
  
  // Team Settings
  updateTeamSettings: (id, data) => api.put(`/teams/${id}/settings`, data),
  
  // Old compatibility (keeping for backward compatibility)
  requestToJoin: (teamId, data) => api.post(`/teams/${teamId}/join-request`, data),
};

// Payment API
export const paymentAPI = {
  getSubscriptionPlans: () => api.get('/payments/subscription-plans'),
  createHackathonOrder: (data) => api.post('/payments/hackathon/create-order', data),
  verifyHackathonPayment: (data) => api.post('/payments/hackathon/verify', data),
  subscribe: (data) => api.post('/payments/subscribe', data),
  cancelSubscription: () => api.post('/payments/subscription/cancel'),
  getPaymentHistory: () => api.get('/payments/history'),
  requestRefund: (paymentId, data) => api.post(`/payments/${paymentId}/refund`, data),
};

// Judge API
export const judgeAPI = {
  getAssignedHackathons: () => api.get('/judge/hackathons'),
  getTeamsForJudging: (hackathonId, roundId) => 
    api.get(`/judge/hackathons/${hackathonId}/rounds/${roundId}/teams`),
  submitScores: (teamId, data) => api.post(`/judge/teams/${teamId}/score`, data),
  updateScores: (scoreId, data) => api.put(`/judge/scores/${scoreId}`, data),
  getMyScores: (hackathonId) => api.get(`/judge/hackathons/${hackathonId}/my-scores`),
};

// Coordinator API
export const coordinatorAPI = {
  getAssignedHackathons: () => api.get('/coordinator/hackathons'),
  getTeams: (hackathonId, params) => api.get(`/coordinator/hackathons/${hackathonId}/teams`, { params }),
  bulkCheckIn: (hackathonId, data) => api.post(`/coordinator/hackathons/${hackathonId}/bulk-checkin`, data),
  exportTeams: (hackathonId) => api.get(`/coordinator/hackathons/${hackathonId}/teams/export`, { responseType: 'blob' }),
  sendAnnouncement: (hackathonId, data) => api.post(`/coordinator/hackathons/${hackathonId}/announcement`, data),
};

export default api;