import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Email,
  Sms,
  PlayArrow,
  Pause,
  Visibility,
  Delete,
  Search,
  FilterList,
  Edit,
  ContentCopy,
  Analytics,
  TrendingUp,
  Schedule,
  Send,
  Download,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { campaignsAPI } from '../../services/api';
import { format } from 'date-fns';

const campaignTypeIcons = {
  email: <Email />,
  sms: <Sms />,
};

const statusColors: Record<string, any> = {
  draft: 'default',
  scheduled: 'info',
  sending: 'warning',
  sent: 'success',
  paused: 'warning',
  cancelled: 'error',
};

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  // Enhanced state management
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<[string, string]>(['', '']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Refresh campaigns when the component becomes visible or window gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCampaigns();
      }
    };

    const handleFocus = () => {
      fetchCampaigns();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignsAPI.getAll();
      // Convert Firestore timestamps to Date objects
      const campaignsWithDates = response.map((campaign: any) => ({
        ...campaign,
        createdAt: campaign.createdAt?.toDate ? campaign.createdAt.toDate() : campaign.createdAt,
        updatedAt: campaign.updatedAt?.toDate ? campaign.updatedAt.toDate() : campaign.updatedAt,
        sentAt: campaign.sentAt?.toDate ? campaign.sentAt.toDate() : campaign.sentAt,
        scheduledAt: campaign.scheduledAt?.toDate ? campaign.scheduledAt.toDate() : campaign.scheduledAt,
      }));
      setCampaigns(campaignsWithDates);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns();
  };

  const handleDuplicate = async () => {
    if (!selectedCampaign) return;
    
    try {
      // Create a copy of the campaign
      const duplicateData = {
        ...selectedCampaign,
        name: `${selectedCampaign.name} (Copy)`,
        status: 'draft'
      };
      await campaignsAPI.create(duplicateData);
      toast.success('Campaign duplicated successfully');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to duplicate campaign');
    }
    handleMenuClose();
  };

  const handleSchedule = () => {
    toast.info('Schedule functionality coming soon');
    handleMenuClose();
  };

  const handleViewAnalytics = () => {
    toast.info('Analytics functionality coming soon');
    handleMenuClose();
  };

  const handleViewDetails = () => {
    if (selectedCampaign?.id) {
      navigate(`/campaigns/${selectedCampaign.id}`);
    }
    handleMenuClose();
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setTypeFilter([]);
    setDateRangeFilter(['', '']);
    fetchCampaigns();
  };

  const getCampaignStats = () => {
    const stats = {
      total: campaigns.length,
      draft: campaigns.filter(c => c.status === 'draft').length,
      scheduled: campaigns.filter(c => c.status === 'scheduled').length,
      sending: campaigns.filter(c => c.status === 'sending').length,
      sent: campaigns.filter(c => c.status === 'sent').length,
      totalRecipients: campaigns.reduce((sum, c) => sum + (c.totalRecipients || 0), 0),
      totalSent: campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0),
      totalOpened: campaigns.reduce((sum, c) => sum + (c.openedCount || 0), 0),
      totalClicked: campaigns.reduce((sum, c) => sum + (c.clickedCount || 0), 0),
    };
    return stats;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, campaign: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };

  const handleSend = async (campaign?: any) => {
    const campaignToSend = campaign || selectedCampaign;
    if (!campaignToSend) return;
    
    if (!window.confirm(`Are you sure you want to send "${campaignToSend.name}" now?`)) {
      return;
    }
    
    try {
      await campaignsAPI.send(campaignToSend.id);
      toast.success('Campaign started successfully');
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send campaign');
    }
    if (!campaign) {
      handleMenuClose();
    }
  };

  const handlePause = async () => {
    if (!selectedCampaign) return;
    
    try {
      await campaignsAPI.pause(selectedCampaign.id);
      toast.success('Campaign paused');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to pause campaign');
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedCampaign) return;
    
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignsAPI.delete(selectedCampaign.id);
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
      } catch (error) {
        toast.error('Failed to delete campaign');
      }
    }
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const stats = getCampaignStats();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Campaigns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.total} campaigns • {stats.totalRecipients} total recipients • {stats.totalSent} sent
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => {/* Export functionality */}}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/campaigns/new')}
          >
            Create Campaign
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
                <Email sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Campaigns
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
                <Send sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.sent}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sent Campaigns
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
                  bgcolor: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.totalRecipients > 0 ? ((stats.totalOpened / stats.totalSent) * 100).toFixed(1) : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Open Rate
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
                <Analytics sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.totalRecipients > 0 ? ((stats.totalClicked / stats.totalSent) * 100).toFixed(1) : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click Rate
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
              placeholder="Search campaigns..."
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
                    {['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'].map((status) => (
                      <MenuItem key={status} value={status}>
                        <Checkbox checked={statusFilter.indexOf(status) > -1} />
                        <ListItemText primary={status} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
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
                    {['email', 'sms'].map((type) => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={typeFilter.indexOf(type) > -1} />
                        <ListItemText primary={type.toUpperCase()} />
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
              <Button size="small" onClick={fetchCampaigns}>
                Apply Filters
              </Button>
              <Button size="small" onClick={clearFilters}>
                Clear All
              </Button>
            </Box>
          </Box>
        )}
      </Card>

      {/* Campaign Grid */}
      {campaigns.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No campaigns yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first email or SMS campaign to start engaging with your contacts
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/campaigns/new')}
          >
            Create Campaign
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {campaigns.map((campaign) => (
            <Grid item xs={12} md={6} lg={4} key={campaign.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box p={2} flex={1}>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          bgcolor: campaign.type === 'email' ? 'primary.light' : 'secondary.light',
                          borderRadius: 1,
                          p: 0.5,
                          display: 'flex',
                        }}
                      >
                        {campaignTypeIcons[campaign.type as keyof typeof campaignTypeIcons]}
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {campaign.type.toUpperCase()}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, campaign)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  {/* Campaign Name */}
                  <Typography variant="h6" gutterBottom>
                    {campaign.name}
                  </Typography>

                  {/* Status */}
                  <Chip
                    label={campaign.status}
                    color={statusColors[campaign.status]}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  {/* Stats */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="caption" color="text.secondary">
                        Recipients
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        {campaign.totalRecipients || campaign.recipientContactIds?.length || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="caption" color="text.secondary">
                        Sent
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        {campaign.sentCount}
                      </Typography>
                    </Box>
                    {campaign.type === 'email' && (
                      <>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            Opened
                          </Typography>
                          <Typography variant="caption" fontWeight="medium">
                            {campaign.openedCount} (
                            {campaign.sentCount > 0
                              ? ((campaign.openedCount / campaign.sentCount) * 100).toFixed(1)
                              : 0}
                            %)
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            Clicked
                          </Typography>
                          <Typography variant="caption" fontWeight="medium">
                            {campaign.clickedCount} (
                            {campaign.sentCount > 0
                              ? ((campaign.clickedCount / campaign.sentCount) * 100).toFixed(1)
                              : 0}
                            %)
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>

                  {/* Progress Bar */}
                  {campaign.status === 'sending' && (
                    <Box mb={2}>
                      <LinearProgress
                        variant="determinate"
                        value={campaign.totalRecipients > 0 ? (campaign.sentCount / campaign.totalRecipients) * 100 : 0}
                      />
                      <Typography variant="caption" color="text.secondary" mt={0.5}>
                        Sending... {campaign.sentCount} of {campaign.totalRecipients || campaign.recipientContactIds?.length || 0}
                      </Typography>
                    </Box>
                  )}

                  {/* Date */}
                  <Typography variant="caption" color="text.secondary">
                    {(() => {
                      const sentDate = campaign.sentAt ? new Date(campaign.sentAt) : null;
                      const scheduledDate = campaign.scheduledAt ? new Date(campaign.scheduledAt) : null;
                      const createdDate = campaign.createdAt ? new Date(campaign.createdAt) : null;
                      
                      if (sentDate && !isNaN(sentDate.getTime())) {
                        return `Sent ${format(sentDate, 'MMM d, yyyy')}`;
                      }
                      if (scheduledDate && !isNaN(scheduledDate.getTime())) {
                        return `Scheduled for ${format(scheduledDate, 'MMM d, yyyy')}`;
                      }
                      if (createdDate && !isNaN(createdDate.getTime())) {
                        return `Created ${format(createdDate, 'MMM d, yyyy')}`;
                      }
                      return 'Date not available';
                    })()}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box p={2} pt={0} display="flex" gap={1}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    View
                  </Button>
                  {campaign.status === 'draft' && (
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => handleSend(campaign)}
                    >
                      Send
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleViewDetails}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <ContentCopy fontSize="small" sx={{ mr: 1 }} /> Duplicate
        </MenuItem>
        <MenuItem onClick={handleViewAnalytics}>
          <Analytics fontSize="small" sx={{ mr: 1 }} /> Analytics
        </MenuItem>
        {selectedCampaign?.status === 'draft' && (
          <>
            <MenuItem onClick={handleSend}>
              <PlayArrow fontSize="small" sx={{ mr: 1 }} /> Send Now
            </MenuItem>
            <MenuItem onClick={handleSchedule}>
              <Schedule fontSize="small" sx={{ mr: 1 }} /> Schedule
            </MenuItem>
          </>
        )}
        {selectedCampaign?.status === 'sending' && (
          <MenuItem onClick={handlePause}>
            <Pause fontSize="small" sx={{ mr: 1 }} /> Pause
          </MenuItem>
        )}
        {selectedCampaign?.status === 'paused' && (
          <MenuItem onClick={handleSend}>
            <PlayArrow fontSize="small" sx={{ mr: 1 }} /> Resume
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
