import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { hackathonAPI, teamAPI } from '../services/api';
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
      console.log('Hackathon loaded, fetching coordinators...');
      fetchCoordinators();
    } else {
      console.log('Waiting for hackathon to load...', hackathon);
    }
  }, [hackathon]);

  const fetchCoordinators = async () => {
    if (!hackathon || !hackathon._id) {
      console.error('❌ Hackathon not loaded yet');
      toast.error('Hackathon data not loaded');
      return;
    }

    try {
      console.log('=== Fetching Coordinators ===');
      console.log('Hackathon ID:', hackathon._id);
      setLoading(true);
      const response = await hackathonAPI.getCoordinators(hackathon._id);
      console.log('Response:', response.data);
      setCoordinators(response.data.coordinators || []);
      setPendingInvites(response.data.pending || []);
      console.log('✅ Loaded:', response.data.coordinators?.length || 0, 'coordinators,', response.data.pending?.length || 0, 'pending');
    } catch (error) {
      console.error('❌ Failed to fetch coordinators:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
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

    try {
      await hackathonAPI.inviteCoordinator(hackathon._id, {
        emailOrUsername,
        permissions,
      });
      toast.success('Coordinator invitation sent successfully!');
      setShowInviteModal(false);
      setEmailOrUsername('');
      fetchCoordinators();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to invite coordinator:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleRemoveCoordinator = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this coordinator?')) return;

    try {
      await hackathonAPI.removeCoordinator(hackathon._id, userId);
      toast.success('Coordinator removed successfully');
      fetchCoordinators();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to remove coordinator:', error);
      toast.error(error.response?.data?.message || 'Failed to remove coordinator');
    }
  };

  const handleCancelInvite = async (userId) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) return;

    try {
      await hackathonAPI.cancelCoordinatorInvite(hackathon._id, userId);
      toast.success('Invitation cancelled');
      fetchCoordinators();
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel invitation');
    }
  };

  const handleResendInvite = async (userId) => {
    try {
      await hackathonAPI.resendCoordinatorInvite(hackathon._id, userId);
      toast.success('Invitation resent successfully');
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to resend invitation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Invite Button */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{coordinators.length}</div>
              <div className="text-sm text-gray-600">Active Coordinators</div>
            </div>
          </div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{pendingInvites.length}</div>
              <div className="text-sm text-gray-600">Pending Invitations</div>
            </div>
          </div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {coordinators.length + pendingInvites.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">
                {pendingInvites.length} Pending Invitation{pendingInvites.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-yellow-700 text-sm">
                These users have been invited but haven't accepted yet.
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {pendingInvites.map((invite) => (
              <div
                key={invite._id}
                className="bg-white rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={invite.profilePicture || 'https://via.placeholder.com/40'}
                    alt={invite.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{invite.fullName}</div>
                    <div className="text-sm text-gray-500">{invite.email}</div>
                  </div>
                </div>
                {isOrganizer && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResendInvite(invite._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Resend invitation"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancelInvite(invite._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel invitation"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Coordinators */}
      <div className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden">
        <div className="p-6 border-b-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Active Coordinators</h3>
        </div>
        {coordinators.length > 0 ? (
          <div className="divide-y-2 divide-gray-200">
            {coordinators.map((coordinator) => (
              <div key={coordinator._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <img
                      src={coordinator.profilePicture || 'https://via.placeholder.com/48'}
                      alt={coordinator.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-gray-900">{coordinator.fullName}</div>
                      <div className="text-sm text-gray-600">{coordinator.email}</div>
                      {coordinator.username && (
                        <div className="text-sm text-gray-500">@{coordinator.username}</div>
                      )}
                      
                      {/* Permissions */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {coordinator.permissions?.canViewTeams && (
                          <Badge variant="secondary" size="sm">View Teams</Badge>
                        )}
                        {coordinator.permissions?.canCheckIn && (
                          <Badge variant="secondary" size="sm">Check-in</Badge>
                        )}
                        {coordinator.permissions?.canAssignTables && (
                          <Badge variant="secondary" size="sm">Assign Tables</Badge>
                        )}
                        {coordinator.permissions?.canViewSubmissions && (
                          <Badge variant="secondary" size="sm">View Submissions</Badge>
                        )}
                        {coordinator.permissions?.canEliminateTeams && (
                          <Badge variant="warning" size="sm">Eliminate Teams</Badge>
                        )}
                        {coordinator.permissions?.canCommunicate && (
                          <Badge variant="secondary" size="sm">Communicate</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {isOrganizer && (
                    <button
                      onClick={() => handleRemoveCoordinator(coordinator._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove coordinator"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No coordinators assigned yet</p>
            {isOrganizer && (
              <Button
                variant="outline"
                icon={UserPlus}
                onClick={() => setShowInviteModal(true)}
                className="mt-4"
              >
                Invite Your First Coordinator
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setEmailOrUsername('');
        }}
        title="Invite Coordinator"
      >
        <form onSubmit={handleInvite} className="space-y-5">
          <div>
            <Input
              label="Email or Username"
              placeholder="Enter user's email or username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              icon={Mail}
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              The user must already have an account on the platform.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Permissions:</p>
            <div className="space-y-2">
              {Object.entries(permissions).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setPermissions({ ...permissions, [key]: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t-2 border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowInviteModal(false);
                setEmailOrUsername('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" icon={UserPlus}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}