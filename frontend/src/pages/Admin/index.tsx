import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Grid,
  Tabs,
  Tab,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  TablePagination,
  CircularProgress,
  Switch,
  FormControlLabel,
  Tooltip as MuiTooltip,
  SelectChangeEvent,
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Refresh, 
  Add, 
  Search,
  Download,
  People,
  PersonAdd,
  PersonOff,
  Security,
  BarChart,
  Settings,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { usersAPI } from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { isAdmin } from '../../utils/rbac';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { safeConvertToDate } from '../../utils/dateHelpers';

interface UserRow {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersLast30Days: number;
  roleDistribution: Record<string, number>;
}

export default function AdminPage() {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [form, setForm] = useState<{ 
    firstName?: string; 
    lastName?: string; 
    role?: string;
    status?: 'active' | 'inactive';
  }>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ 
    email: string; 
    password?: string; 
    firstName?: string; 
    lastName?: string; 
    role?: string;
    status?: 'active' | 'inactive';
  }>({ email: '', role: 'user', status: 'active' });
  
  // Enhanced table features
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof UserRow | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsersLast30Days: 0,
    roleDistribution: {}
  });
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  const canManage = useMemo(() => isAdmin(currentUser), [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setUsers(data as any);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const active = users.filter(u => u.status !== 'inactive').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    const newUsers = users.filter(u => {
      if (!u.createdAt) return false;
      const created = safeConvertToDate(u.createdAt);
      return created >= thirtyDaysAgo;
    }).length;

    const roleDist: Record<string, number> = {};
    users.forEach(u => {
      const role = u.role || 'user';
      roleDist[role] = (roleDist[role] || 0) + 1;
    });

    setStats({
      totalUsers: users.length,
      activeUsers: active,
      inactiveUsers: inactive,
      newUsersLast30Days: newUsers,
      roleDistribution: roleDist
    });
  };

  // Calculate user growth data for charts (last 30 days)
  const getUserGrowthData = useMemo(() => {
    const days = 30;
    const now = new Date();
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const usersOnDate = users.filter(u => {
        if (!u.createdAt) return false;
        const created = safeConvertToDate(u.createdAt);
        return created >= date && created < nextDate;
      }).length;
      
      // Calculate cumulative
      const usersBefore = users.filter(u => {
        if (!u.createdAt) return false;
        const created = safeConvertToDate(u.createdAt);
        return created < nextDate;
      }).length;
      
      data.push({
        date: format(date, 'MMM d'),
        users: usersOnDate,
        cumulative: usersBefore + usersOnDate
      });
    }
    
    return data;
  }, [users]);

  // Prepare role distribution data for pie chart
  const roleDistributionData = useMemo(() => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    return Object.entries(stats.roleDistribution).map(([role, value], index) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value,
      color: COLORS[index % COLORS.length]
    }));
  }, [stats.roleDistribution]);

  const handleSort = (field: keyof UserRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof UserRow }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
  };

  const openEdit = (u: UserRow) => {
    setSelected(u);
    setForm({ 
      firstName: u.firstName || '', 
      lastName: u.lastName || '', 
      role: u.role || 'user',
      status: u.status || 'active'
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selected) return;
    try {
      await usersAPI.update(selected.id, form);
      toast.success('User updated');
      setEditOpen(false);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update user');
    }
  };

  const deleteUser = async (u: UserRow) => {
    if (!window.confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    try {
      await usersAPI.delete(u.id);
      toast.success('User deleted');
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete user');
    }
  };

  const createUser = async () => {
    if (!createForm.email) {
      toast.error('Email is required');
      return;
    }
    try {
      await usersAPI.create(createForm);
      toast.success('User created');
      setCreateOpen(false);
      setCreateForm({ email: '', role: 'user', status: 'active' });
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create user');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await usersAPI.update(userId, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update user status');
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    if (action === 'delete' && !window.confirm(`Delete ${selectedUsers.length} user(s)? This cannot be undone.`)) {
      return;
    }

    try {
      if (action === 'delete') {
        await Promise.all(selectedUsers.map(id => usersAPI.delete(id)));
        toast.success(`${selectedUsers.length} user(s) deleted`);
      } else {
        const status = action === 'activate' ? 'active' : 'inactive';
        await Promise.all(selectedUsers.map(id => usersAPI.update(id, { status })));
        toast.success(`${selectedUsers.length} user(s) ${action === 'activate' ? 'activated' : 'deactivated'}`);
      }
      setSelectedUsers([]);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || `Failed to ${action} users`);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Created', 'Last Login'];
    const rows = filteredUsers.map(u => [
      [u.firstName, u.lastName].filter(Boolean).join(' ') || '—',
      u.email,
      u.role || 'user',
      u.status || 'active',
      u.createdAt ? format(safeConvertToDate(u.createdAt), 'MMM d, yyyy') : '—',
      u.lastLoginAt ? format(safeConvertToDate(u.lastLoginAt), 'MMM d, yyyy h:mm a') : 'Never'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Users exported to CSV');
  };

  // Filter, search, and sort users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(query) ||
        (u.firstName?.toLowerCase().includes(query)) ||
        (u.lastName?.toLowerCase().includes(query)) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => (u.role || 'user') === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => (u.status || 'active') === statusFilter);
    }

    // Sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Handle dates
        if (sortField === 'createdAt' || sortField === 'lastLoginAt' || sortField === 'updatedAt') {
          aValue = aValue ? safeConvertToDate(aValue).getTime() : 0;
          bValue = bValue ? safeConvertToDate(bValue).getTime() : 0;
        }

        // Handle strings (name, email, role)
        if (sortField === 'email' || sortField === 'role') {
          aValue = (aValue || '').toString().toLowerCase();
          bValue = (bValue || '').toString().toLowerCase();
        }

        // Handle name (combine first and last)
        if (sortField === 'firstName' || sortField === 'lastName') {
          aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
          bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
        }

        // Compare values
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const renderOverviewTab = () => (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <People sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PersonAdd sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    bgcolor: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PersonOff sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.inactiveUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Inactive Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    bgcolor: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BarChart sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.newUsersLast30Days}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Users (30d)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Growth (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getUserGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#8884d8" 
                    name="Total Users"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#82ca9d" 
                    name="New Users"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Role Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Stack direction="row" spacing={2} flexWrap="wrap" mt={2}>
                {roleDistributionData.map((item) => (
                  <Chip
                    key={item.name}
                    label={`${item.name}: ${item.value}`}
                    sx={{ 
                      bgcolor: item.color,
                      color: 'white',
                      mb: 1
                    }}
                    size="small"
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderUsersTab = () => (
    <Box>
      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e: SelectChangeEvent) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                  <MenuItem value="support">Support</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={exportToCSV}
                  disabled={filteredUsers.length === 0}
                >
                  Export CSV
                </Button>
                {selectedUsers.length > 0 && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleBulkAction('activate')}
                    >
                      Activate ({selectedUsers.length})
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleBulkAction('deactivate')}
                    >
                      Deactivate ({selectedUsers.length})
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleBulkAction('delete')}
                    >
                      Delete ({selectedUsers.length})
                    </Button>
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < paginatedUsers.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={0.5} 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSort('firstName')}
                    >
                      Name
                      <SortIcon field="firstName" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={0.5} 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSort('email')}
                    >
                      Email
                      <SortIcon field="email" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={0.5} 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSort('role')}
                    >
                      Role
                      <SortIcon field="role" />
                    </Box>
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={0.5} 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSort('createdAt')}
                    >
                      Created
                      <SortIcon field="createdAt" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={0.5} 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSort('lastLoginAt')}
                    >
                      Last Login
                      <SortIcon field="lastLoginAt" />
                    </Box>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary">
                        {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' 
                          ? 'No users found matching filters'
                          : 'No users found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((u) => (
                    <TableRow key={u.id} hover selected={selectedUsers.includes(u.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => handleSelectUser(u.id)}
                        />
                      </TableCell>
                      <TableCell>{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={u.role || 'user'} 
                          color={u.role === 'admin' ? 'primary' : 'default'} 
                        />
                      </TableCell>
                      <TableCell>
                        <MuiTooltip title={u.status === 'active' ? 'Click to deactivate' : 'Click to activate'}>
                          <Switch
                            size="small"
                            checked={u.status !== 'inactive'}
                            onChange={() => toggleUserStatus(u.id, u.status || 'active')}
                            disabled={!canManage || currentUser?.id === u.id}
                          />
                        </MuiTooltip>
                      </TableCell>
                      <TableCell>
                        {u.createdAt ? (
                          <Typography variant="body2">
                            {format(safeConvertToDate(u.createdAt), 'MMM d, yyyy')}
                          </Typography>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {u.lastLoginAt ? (
                          <Typography variant="body2" color="text.secondary">
                            {format(safeConvertToDate(u.lastLoginAt), 'MMM d, yyyy h:mm a')}
                          </Typography>
                        ) : (
                          <Chip size="small" label="Never" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <MuiTooltip title="Edit User">
                          <IconButton 
                            size="small" 
                            disabled={!canManage} 
                            onClick={() => openEdit(u)}
                          >
                            <Edit />
                          </IconButton>
                        </MuiTooltip>
                        <MuiTooltip title="Delete User">
                          <IconButton 
                            size="small" 
                            color="error" 
                            disabled={!canManage || currentUser?.id === u.id} 
                            onClick={() => deleteUser(u)}
                          >
                            <Delete />
                          </IconButton>
                        </MuiTooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Admin Dashboard</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} sx={{ mr: 1 }} onClick={() => setCreateOpen(true)} disabled={!canManage}>
            New User
          </Button>
          <Button onClick={fetchUsers} startIcon={<Refresh />} disabled={loading}>
            Refresh
          </Button>
        </Box>
      </Stack>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<BarChart />} label="Overview" />
        <Tab icon={<People />} label="Users" />
        <Tab icon={<Settings />} label="Settings" disabled />
        <Tab icon={<Security />} label="Security" disabled />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && renderOverviewTab()}
      {activeTab === 1 && renderUsersTab()}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography>Settings tab coming soon...</Typography>
          </CardContent>
        </Card>
      )}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography>Security & Audit Logs tab coming soon...</Typography>
          </CardContent>
        </Card>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box mt={1} display="grid" gap={2}>
            <TextField 
              label="First Name" 
              value={form.firstName || ''} 
              onChange={(e) => setForm({ ...form, firstName: e.target.value })} 
            />
            <TextField 
              label="Last Name" 
              value={form.lastName || ''} 
              onChange={(e) => setForm({ ...form, lastName: e.target.value })} 
            />
            <FormControl>
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role || 'user'}
                label="Role"
                onChange={(e: SelectChangeEvent) => setForm({ ...form, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="support">Support</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={form.status !== 'inactive'}
                  onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New User</DialogTitle>
        <DialogContent>
          <Box mt={1} display="grid" gap={2}>
            <TextField 
              label="Email" 
              type="email" 
              value={createForm.email} 
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} 
              required 
            />
            <TextField 
              label="Password" 
              type="password" 
              value={createForm.password || ''} 
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} 
            />
            <TextField 
              label="First Name" 
              value={createForm.firstName || ''} 
              onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} 
            />
            <TextField 
              label="Last Name" 
              value={createForm.lastName || ''} 
              onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} 
            />
            <FormControl>
              <InputLabel>Role</InputLabel>
              <Select
                value={createForm.role || 'user'}
                label="Role"
                onChange={(e: SelectChangeEvent) => setCreateForm({ ...createForm, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="support">Support</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createUser} disabled={!canManage}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
