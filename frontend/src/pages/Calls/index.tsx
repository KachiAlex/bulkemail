import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  Typography,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Avatar,
  Divider,
  Grid,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText as MuiListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Checkbox,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Phone,
  PhoneCallback,
  PhoneMissed,
  CallMade,
  CallReceived,
  Schedule,
  Person,
  Business,
  Assessment,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { crmAPI } from '../../services/crm-api';
import { format } from 'date-fns';

const callTypeIcons = {
  incoming: <CallReceived />,
  outgoing: <CallMade />,
  missed: <PhoneMissed />,
  callback: <PhoneCallback />,
};

const callStatusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  completed: 'success',
  missed: 'error',
  busy: 'warning',
  no_answer: 'warning',
  cancelled: 'error',
};

export default function Calls() {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [callDetailsOpen, setCallDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Filtering states
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<[string, string]>(['', '']);
  
  // View states
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await crmAPI.getCalls();
      setCalls(response);
    } catch (error: any) {
      console.error('Error fetching calls:', error);
      toast.error(error.message || 'Failed to load calls');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCalls();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, call: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedCall(call);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCall(null);
  };

  const handleEdit = () => {
    if (selectedCall) {
      navigate(`/calls/${selectedCall.id}`);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedCall) return;

    try {
      // For now, just show a message since deleteCall doesn't exist
      toast.info('Delete functionality coming soon');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete call');
    }
    handleMenuClose();
  };

  const handleViewDetails = () => {
    setCallDetailsOpen(true);
    handleMenuClose();
  };

  const handleMakeCall = (phoneNumber: string) => {
    // This would integrate with a telephony service
    toast.info(`Calling ${phoneNumber}...`);
  };

  const handleCallback = (phoneNumber: string) => {
    // This would schedule a callback
    toast.info(`Callback scheduled for ${phoneNumber}`);
  };

  const clearFilters = () => {
    setTypeFilter([]);
    setStatusFilter([]);
    setDateRangeFilter(['', '']);
    fetchCalls();
  };

  const getCallStats = () => {
    const stats = {
      total: calls.length,
      incoming: calls.filter(c => c.type === 'incoming').length,
      outgoing: calls.filter(c => c.type === 'outgoing').length,
      missed: calls.filter(c => c.status === 'missed').length,
      completed: calls.filter(c => c.status === 'completed').length,
      totalDuration: calls.reduce((sum, c) => sum + (c.duration || 0), 0),
      avgDuration: calls.length > 0 ? calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length : 0,
    };
    return stats;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderListView = () => {
    return (
      <Card>
        <List>
          {calls.map((call) => (
            <ListItem key={call.id} divider>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: call.type === 'incoming' ? 'success.main' : 'primary.main' }}>
                  {callTypeIcons[call.type as keyof typeof callTypeIcons]}
                </Avatar>
              </ListItemIcon>
              <MuiListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" fontWeight="medium">
                      {call.contactName || call.phoneNumber}
                    </Typography>
                    <Chip
                      label={call.type}
                      color={call.type === 'incoming' ? 'success' : 'primary'}
                      size="small"
                    />
                    <Chip
                      label={call.status}
                      color={callStatusColors[call.status]}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {call.phoneNumber}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="caption">
                          {format(new Date(call.timestamp), 'MMM d, yyyy h:mm a')}
                        </Typography>
                      </Box>
                      {call.duration && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Assessment fontSize="small" color="action" />
                          <Typography variant="caption">
                            {formatDuration(call.duration)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box display="flex" gap={1}>
                  <Tooltip title="Call Back">
                    <IconButton
                      size="small"
                      onClick={() => handleCallback(call.phoneNumber)}
                    >
                      <PhoneCallback />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, call)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Card>
    );
  };

  const renderTimelineView = () => {
    const groupedCalls = calls.reduce((groups, call) => {
      const date = format(new Date(call.timestamp), 'MMM d, yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(call);
      return groups;
    }, {} as Record<string, any[]>);

    return (
      <Box>
        {Object.entries(groupedCalls).map(([date, dateCalls]) => (
          <Card key={date} sx={{ mb: 2 }}>
            <Box p={2} bgcolor="grey.50">
              <Typography variant="h6" fontWeight="bold">
                {date}
              </Typography>
            </Box>
            <List>
              {(dateCalls as any[]).map((call: any, index: number) => (
                <ListItem key={call.id} divider={index < (dateCalls as any[]).length - 1}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: call.type === 'incoming' ? 'success.main' : 'primary.main' }}>
                      {callTypeIcons[call.type as keyof typeof callTypeIcons]}
                    </Avatar>
                  </ListItemIcon>
                  <MuiListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight="medium">
                          {call.contactName || call.phoneNumber}
                        </Typography>
                        <Chip
                          label={call.type}
                          color={call.type === 'incoming' ? 'success' : 'primary'}
                          size="small"
                        />
                        <Chip
                          label={call.status}
                          color={callStatusColors[call.status]}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {call.phoneNumber}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mt={1}>
                          <Typography variant="caption">
                            {format(new Date(call.timestamp), 'h:mm a')}
                          </Typography>
                          {call.duration && (
                            <Typography variant="caption">
                              Duration: {formatDuration(call.duration)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Call Back">
                        <IconButton
                          size="small"
                          onClick={() => handleCallback(call.phoneNumber)}
                        >
                          <PhoneCallback />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, call)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Card>
        ))}
      </Box>
    );
  };

  const stats = getCallStats();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Calls
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.total} calls • {formatDuration(stats.totalDuration)} total duration
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => toast.info('Log call functionality coming soon')}
          >
            Log Call
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
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
                <Phone sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Calls
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
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
                <CallReceived sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.incoming}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Incoming
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PhoneMissed sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.missed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Missed
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
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
                <Assessment sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {formatDuration(Math.round(stats.avgDuration))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Duration
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <form onSubmit={handleSearch} style={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search calls..."
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
          </form>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filters
          </Button>
        </Box>

        {/* Advanced Filters */}
        {filtersOpen && (
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    multiple
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as string[])}
                    input={<OutlinedInput label="Type" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {['incoming', 'outgoing', 'missed', 'callback'].map((type) => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={typeFilter.indexOf(type) > -1} />
                        <MuiListItemText primary={type} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as string[])}
                    input={<OutlinedInput label="Status" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {['completed', 'missed', 'busy', 'no_answer', 'cancelled'].map((status) => (
                      <MenuItem key={status} value={status}>
                        <Checkbox checked={statusFilter.indexOf(status) > -1} />
                        <MuiListItemText primary={status.replace('_', ' ')} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Date"
                  type="date"
                  value={dateRangeFilter[0]}
                  onChange={(e) => setDateRangeFilter([e.target.value, dateRangeFilter[1]])}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Date"
                  type="date"
                  value={dateRangeFilter[1]}
                  onChange={(e) => setDateRangeFilter([dateRangeFilter[0], e.target.value])}
                />
              </Grid>
            </Grid>
            <Box mt={2} display="flex" gap={1}>
              <Button size="small" onClick={fetchCalls}>
                Apply Filters
              </Button>
              <Button size="small" onClick={clearFilters}>
                Clear All
              </Button>
            </Box>
          </Box>
        )}
      </Card>

      {/* Main Content */}
      {viewMode === 'list' ? renderListView() : renderTimelineView()}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleMakeCall(selectedCall?.phoneNumber)}>
          <Phone fontSize="small" sx={{ mr: 1 }} /> Call Back
        </MenuItem>
        <MenuItem onClick={() => handleCallback(selectedCall?.phoneNumber)}>
          <PhoneCallback fontSize="small" sx={{ mr: 1 }} /> Schedule Callback
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Call Details Dialog */}
      <Dialog 
        open={callDetailsOpen} 
        onClose={() => setCallDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          {selectedCall && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedCall.contactName || selectedCall.phoneNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCall.phoneNumber}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton onClick={() => handleMakeCall(selectedCall.phoneNumber)}>
                    <Phone />
                  </IconButton>
                  <IconButton onClick={handleEdit}>
                    <Edit />
                  </IconButton>
                </Box>
              </Box>

              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                <Tab label="Details" />
                <Tab label="Recording" />
                <Tab label="Notes" />
              </Tabs>

              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Call Information
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2">Type: {selectedCall.type}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Assessment fontSize="small" color="action" />
                        <Typography variant="body2">Status: {selectedCall.status}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2">
                          Time: {format(new Date(selectedCall.timestamp), 'MMM d, yyyy h:mm a')}
                        </Typography>
                      </Box>
                      {selectedCall.duration && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Assessment fontSize="small" color="action" />
                          <Typography variant="body2">
                            Duration: {formatDuration(selectedCall.duration)}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Contact Information
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">{selectedCall.contactName || 'Unknown'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Business fontSize="small" color="action" />
                        <Typography variant="body2">{selectedCall.company || 'No company'}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Call Recording
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No recording available.
                  </Typography>
                </Paper>
              )}

              {activeTab === 2 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Call Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No notes recorded.
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Delete Call?
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Are you sure you want to delete this call record? This action cannot be undone.
          </Typography>
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}