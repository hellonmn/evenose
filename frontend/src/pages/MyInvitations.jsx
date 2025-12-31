import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  ExternalLink,
  Calendar,
  MapPin,
  Trophy,
} from 'lucide-react';
import { hackathonAPI, authAPI } from '../services/api';
import { useAuthStore } from '../store';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function MyInvitations() {
  const { user } = useAuthStore();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      
      // Filter for pending coordinator invitations
      const pendingInvites = response.data.user.coordinatorFor?.filter(
        (coord) => coord.status === 'pending'
      ) || [];

      // Fetch hackathon details for each invitation
      const invitesWithDetails = await Promise.all(
        pendingInvites.map(async (invite) => {
          try {
            const hackathonRes = await hackathonAPI.getById(invite.hackathon);
            return {
              ...invite,
              hackathonDetails: hackathonRes.data.hackathon,
            };
          } catch (error) {
            console.error('Failed to fetch hackathon details:', error);
            return null;
          }
        })
      );

      setInvitations(invitesWithDetails.filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (hackathonId) => {
    try {
      await hackathonAPI.acceptCoordinatorInvitation(hackathonId);
      toast.success('Invitation accepted! You are now a coordinator.');
      fetchInvitations();
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDecline = async (hackathonId) => {
    if (!window.confirm('Are you sure you want to decline this invitation?')) return;

    try {
      await hackathonAPI.declineCoordinatorInvitation(hackathonId);
      toast.success('Invitation declined');
      fetchInvitations();
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to decline invitation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Invitations</h1>
          <p className="text-gray-600">
            Coordinator invitations for hackathons you've been invited to join
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{invitations.length}</div>
                <div className="text-sm text-gray-600">Pending Invitations</div>
              </div>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {user?.coordinatorFor?.filter((c) => c.status === 'accepted').length || 0}
                </div>
                <div className="text-sm text-gray-600">Active Coordinations</div>
              </div>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {user?.coordinatorFor?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Invitations List */}
        {invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((invitation, index) => (
              <motion.div
                key={invitation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-6 h-6 text-indigo-600" />
                        <h3 className="text-2xl font-bold text-gray-900">
                          Coordinator Invitation
                        </h3>
                      </div>
                      <Link
                        to={`/hackathons/${invitation.hackathonDetails._id}`}
                        className="text-xl font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
                      >
                        {invitation.hackathonDetails.title}
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </div>
                    <Badge variant="warning">
                      <Clock className="w-4 h-4 mr-1" />
                      Pending
                    </Badge>
                  </div>

                  {/* Hackathon Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Start Date</div>
                        <div className="font-semibold text-gray-900">
                          {format(
                            new Date(invitation.hackathonDetails.hackathonStartDate),
                            'MMM dd, yyyy'
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Mode</div>
                        <div className="font-semibold text-gray-900 capitalize">
                          {invitation.hackathonDetails.mode}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Invited</div>
                        <div className="font-semibold text-gray-900">
                          {format(new Date(invitation.invitedAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Your Permissions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {invitation.permissions?.canViewTeams && (
                        <Badge variant="secondary" size="sm">
                          View Teams
                        </Badge>
                      )}
                      {invitation.permissions?.canCheckIn && (
                        <Badge variant="secondary" size="sm">
                          Check-in
                        </Badge>
                      )}
                      {invitation.permissions?.canAssignTables && (
                        <Badge variant="secondary" size="sm">
                          Assign Tables
                        </Badge>
                      )}
                      {invitation.permissions?.canViewSubmissions && (
                        <Badge variant="secondary" size="sm">
                          View Submissions
                        </Badge>
                      )}
                      {invitation.permissions?.canEliminateTeams && (
                        <Badge variant="warning" size="sm">
                          Eliminate Teams
                        </Badge>
                      )}
                      {invitation.permissions?.canCommunicate && (
                        <Badge variant="secondary" size="sm">
                          Communicate
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      icon={CheckCircle}
                      onClick={() => handleAccept(invitation.hackathonDetails._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Accept Invitation
                    </Button>
                    <Button
                      variant="outline"
                      icon={XCircle}
                      onClick={() => handleDecline(invitation.hackathonDetails._id)}
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No pending invitations</h3>
            <p className="text-gray-500">
              You don't have any coordinator invitations at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}