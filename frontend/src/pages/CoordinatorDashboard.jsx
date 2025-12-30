import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Download, UserCheck, Hash, ArrowLeft } from 'lucide-react';
import { hackathonAPI, teamAPI } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

export default function CoordinatorDashboard() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  
  const [hackathon, setHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [assignData, setAssignData] = useState({ tableNumber: '', teamNumber: '' });

  useEffect(() => {
    fetchData();
  }, [hackathonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hackathonRes, teamsRes] = await Promise.all([
        hackathonAPI.getById(hackathonId),
        teamAPI.getByHackathon(hackathonId),
      ]);
      
      setHackathon(hackathonRes.data.hackathon);
      setTeams(teamsRes.data.teams || []);
      
      // Get user's permissions for this hackathon
      const user = hackathonRes.data.hackathon.coordinators?.find(
        c => c.user === localStorage.getItem('userId') // Adjust based on your auth implementation
      );
      setPermissions(user?.permissions || {});
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (teamId) => {
    if (!permissions.canCheckIn) {
      toast.error('You do not have permission to check-in teams');
      return;
    }

    try {
      await teamAPI.checkIn(teamId);
      toast.success('Team checked in successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to check-in team:', error);
      toast.error(error.response?.data?.message || 'Failed to check-in team');
    }
  };

  const handleAssign = async () => {
    if (!permissions.canAssignTables) {
      toast.error('You do not have permission to assign tables/numbers');
      return;
    }

    try {
      await teamAPI.assign(selectedTeam._id, {
        tableNumber: assignData.tableNumber ? parseInt(assignData.tableNumber) : undefined,
        teamNumber: assignData.teamNumber ? parseInt(assignData.teamNumber) : undefined,
      });
      toast.success('Assignment successful!');
      setShowAssignModal(false);
      setSelectedTeam(null);
      setAssignData({ tableNumber: '', teamNumber: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to assign:', error);
      toast.error(error.response?.data?.message || 'Failed to assign');
    }
  };

  const exportTeams = () => {
    // Simple CSV export
    const csv = [
      ['Team Name', 'Members', 'Status', 'Check-in', 'Table', 'Team Number'].join(','),
      ...teams.map(team => [
        team.name,
        team.members?.length || 0,
        team.status,
        team.checkIn?.status || 'not checked-in',
        team.tableNumber || 'N/A',
        team.teamNumber || 'N/A',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hackathon?.title || 'hackathon'}-teams.csv`;
    a.click();
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/my-coordinations')}
            className="mb-4"
          >
            Back to Coordinations
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {hackathon?.title}
          </h1>
          <p className="text-gray-600">Team Management Dashboard</p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                icon={Search}
                placeholder="Search teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button icon={Download} onClick={exportTeams} variant="outline">
              Export
            </Button>
          </div>
        </Card>

        {/* Permissions Info */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <h3 className="text-sm font-semibold mb-2">Your Permissions:</h3>
          <div className="flex flex-wrap gap-2 text-sm">
            {Object.entries(permissions).map(([key, value]) => (
              value && (
                <Badge key={key} variant="info">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              )
            ))}
          </div>
        </Card>

        {/* Teams Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeams.map((team) => (
                  <tr key={team._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.members?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={team.status === 'approved' ? 'success' : 'warning'}>
                        {team.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={team.checkIn?.status === 'checked-in' ? 'success' : 'secondary'}>
                        {team.checkIn?.status || 'not checked-in'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.tableNumber || team.teamNumber ? (
                        <div>
                          {team.tableNumber && <div>Table: {team.tableNumber}</div>}
                          {team.teamNumber && <div>Team: {team.teamNumber}</div>}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {permissions.canCheckIn && team.checkIn?.status !== 'checked-in' && (
                        <Button
                          size="sm"
                          icon={UserCheck}
                          onClick={() => handleCheckIn(team._id)}
                        >
                          Check-in
                        </Button>
                      )}
                      {permissions.canAssignTables && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Hash}
                          onClick={() => {
                            setSelectedTeam(team);
                            setAssignData({
                              tableNumber: team.tableNumber || '',
                              teamNumber: team.teamNumber || '',
                            });
                            setShowAssignModal(true);
                          }}
                        >
                          Assign
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No teams found
            </div>
          )}
        </Card>

        {/* Assign Modal */}
        <Modal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedTeam(null);
          }}
          title={`Assign Numbers - ${selectedTeam?.name}`}
        >
          <div className="space-y-4">
            <Input
              label="Table Number"
              type="number"
              value={assignData.tableNumber}
              onChange={(e) => setAssignData({ ...assignData, tableNumber: e.target.value })}
              placeholder="e.g., 5"
            />
            <Input
              label="Team Number"
              type="number"
              value={assignData.teamNumber}
              onChange={(e) => setAssignData({ ...assignData, teamNumber: e.target.value })}
              placeholder="e.g., 42"
            />
            <div className="flex gap-4 justify-end mt-6">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssign}>
                Assign
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}