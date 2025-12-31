import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  UserPlus,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Trash2,
  RefreshCw,
  Eye,
  Users,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { hackathonAPI } from '../services/api';
import { useAuthStore } from '../store';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

export default function CoordinatorsManagement({ hackathon, isOrganizer, onRefresh }) {
  const { user } = useAuthStore();
  const [coordinators, setCoordinators] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [inviting, setInviting] = useState(false);
  const [resendingId, setResendingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [permissions, setPermissions] = useState({
    canViewTeams: true,
    canCheckIn: true,
    canAssignTables: false,
    canViewSubmissions: true,
    canEliminateTeams: false,
    canCommunicate: true,
  });

  useEffect(() => {
    if (hackathon && hackathon._id) {
      fetchCoordinators();
    }
  }, [hackathon]);

  const fetchCoordinators = async () => {
    if (!hackathon || !hackathon._id) {
      toast.error('Hackathon data not loaded');
      return;
    }

    try {
      setLoading(true);
      const response = await hackathonAPI.getCoordinators(hackathon._id);
      setCoordinators(response.data.coordinators || []);
      setPendingInvites(response.data.pending || []);
    } catch (error) {
      console.error('Failed to fetch coordinators:', error);
      toast.error(error.response?.data?.message || 'Failed to load coordinators');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    
    if (!emailOrUsername.trim()) {
      toast.error('Please enter email or username');
      return;
    }

    setInviting(true);
    try {
      const response = await hackathonAPI.inviteCoordinator(hackathon._id, {
        emailOrUsername: emailOrUsername.trim(),
        permissions,
      });
      
      toast.success(response.data.message || 'Coordinator invitation sent successfully!');
      setShowInviteModal(false);
      setEmailOrUsername('');
      fetchCoordinators();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to invite coordinator:', error);
      
      if (error.response?.data?.alreadyInvited) {
        if (error.response.data.status === 'pending') {
          toast.error(
            error.response.data.message || 'Invitation already sent. Use "Resend" to send again.',
            { duration: 4000 }
          );
        } else if (error.response.data.status === 'accepted') {
          toast.error('This user is already an active coordinator');
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to send invitation');
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCoordinator = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this coordinator? They will lose all access immediately.')) return;

    setRemovingId(userId);
    try {
      await hackathonAPI.removeCoordinator(hackathon._id, userId);
      toast.success('Coordinator removed successfully');
      fetchCoordinators();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to remove coordinator:', error);
      toast.error(error.response?.data?.message || 'Failed to remove coordinator');
    } finally {
      setRemovingId(null);
    }
  };

  const handleCancelInvite = async (userId) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) return;

    setCancelingId(userId);
    try {
      await hackathonAPI.cancelCoordinatorInvite(hackathon._id, userId);
      toast.success('Invitation cancelled');
      fetchCoordinators();
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel invitation');
    } finally {
      setCancelingId(null);
    }
  };

  const handleResendInvite = async (userId, userEmail) => {
    setResendingId(userId);
    try {
      const response = await hackathonAPI.resendCoordinatorInvite(hackathon._id, userId);
      toast.success(response.data.message || 'Invitation email sent successfully!', {
        duration: 4000,
        icon: '📧',
      });
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setResendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading coordinators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coordinators</h2>
          <p className="text-gray-600 mt-1">
            Manage coordinators and their permissions for this hackathon
          </p>
        </div>
        {isOrganizer && (
          <Button icon={UserPlus} onClick={() => setShowInviteModal(true)}>
            Invite Coordinator
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{coordinators.length}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{pendingInvites.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{coordinators.length + pendingInvites.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pending Invitations */}
      <AnimatePresence>
        {pendingInvites.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">{pendingInvites.length} Pending Invitation{pendingInvites.length !== 1 ? 's' : ''}</h3>
                <p className="text-yellow-700 text-sm">Invited users haven't accepted yet. You can resend the email or cancel the invitation.</p>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {pendingInvites.map((invite) => (
                <motion.div key={invite._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={invite.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(invite.fullName)}&background=random`} alt={invite.fullName} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-gray-900">{invite.fullName}</div>
                      <div className="text-sm text-gray-500">{invite.email}</div>
                      {invite.username && <div className="text-xs text-gray-400">@{invite.username}</div>}
                    </div>
                  </div>
                  {isOrganizer && (
                    <div className="flex gap-2">
                      <button onClick={() => handleResendInvite(invite._id, invite.email)} disabled={resendingId === invite._id} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50" title="Resend email">
                        {resendingId === invite._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleCancelInvite(invite._id)} disabled={cancelingId === invite._id} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Cancel">
                        {cancelingId === invite._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Coordinators */}
      <div className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden">
        <div className="p-6 border-b-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Active Coordinators</h3>
        </div>
        {coordinators.length > 0 ? (
          <div className="divide-y-2 divide-gray-200">
            {coordinators.map((coordinator, index) => (
              <motion.div key={coordinator._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <img src={coordinator.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(coordinator.fullName)}&background=random`} alt={coordinator.fullName} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-gray-900">{coordinator.fullName}</div>
                      <div className="text-sm text-gray-600">{coordinator.email}</div>
                      {coordinator.username && <div className="text-sm text-gray-500">@{coordinator.username}</div>}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {coordinator.permissions?.canViewTeams && <Badge variant="secondary" size="sm"><Eye className="w-3 h-3 mr-1" />View Teams</Badge>}
                        {coordinator.permissions?.canCheckIn && <Badge variant="secondary" size="sm"><CheckCircle className="w-3 h-3 mr-1" />Check-in</Badge>}
                        {coordinator.permissions?.canAssignTables && <Badge variant="secondary" size="sm">Assign Tables</Badge>}
                        {coordinator.permissions?.canViewSubmissions && <Badge variant="secondary" size="sm">View Submissions</Badge>}
                        {coordinator.permissions?.canEliminateTeams && <Badge variant="warning" size="sm">Eliminate Teams</Badge>}
                        {coordinator.permissions?.canCommunicate && <Badge variant="secondary" size="sm"><Mail className="w-3 h-3 mr-1" />Communicate</Badge>}
                      </div>
                    </div>
                  </div>
                  {isOrganizer && (
                    <button onClick={() => handleRemoveCoordinator(coordinator._id)} disabled={removingId === coordinator._id} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Remove">
                      {removingId === coordinator._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No coordinators assigned yet</p>
            {isOrganizer && <Button variant="outline" icon={UserPlus} onClick={() => setShowInviteModal(true)}>Invite Your First Coordinator</Button>}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => { if (!inviting) { setShowInviteModal(false); setEmailOrUsername(''); } }} title="Invite Coordinator">
        <form onSubmit={handleInvite} className="space-y-5">
          <div>
            <Input label="Email or Username" placeholder="Enter user's email or username" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} icon={Mail} required disabled={inviting} />
            <p className="text-sm text-gray-500 mt-2">💡 The user must already have an account on the platform.</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Permissions:</p>
            <div className="space-y-2">
              {Object.entries({ canViewTeams: 'View Teams', canCheckIn: 'Check-in Participants', canAssignTables: 'Assign Tables', canViewSubmissions: 'View Submissions', canEliminateTeams: 'Eliminate Teams', canCommunicate: 'Send Communications' }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={permissions[key]} onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })} disabled={inviting} className="w-5 h-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t-2 border-gray-200">
            <Button type="button" variant="outline" onClick={() => { setShowInviteModal(false); setEmailOrUsername(''); }} disabled={inviting}>Cancel</Button>
            <Button type="submit" disabled={inviting}>{inviting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending...</> : <><UserPlus className="w-4 h-4 mr-2" />Send Invitation</>}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}