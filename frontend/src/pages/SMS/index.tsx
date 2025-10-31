import { useEffect, useState } from 'react';
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
  Badge,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Delete,
  Visibility,
  Send,
  Reply,
  Forward,
  Star,
  StarBorder,
  Archive,
  MarkAsUnread,
  AttachFile,
  Sms,
  Inbox,
  Drafts,
  ViewList,
  ViewModule,
  ExpandMore,
  Schedule,
  Phone,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { crmAPI } from '../../services/crm-api';
import { format } from 'date-fns';

const smsStatusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  unread: 'error',
  read: 'default',
  sent: 'success',
  delivered: 'success',
  failed: 'error',
  pending: 'warning',
};

const priorityColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  low: 'default',
  normal: 'primary',
  high: 'warning',
  urgent: 'error',
};

export default function SMS() {
  const [sms, setSms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSms, setSelectedSms] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [smsDetailsOpen, setSmsDetailsOpen] = useState(false);
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeFolder, setActiveFolder] = useState('inbox');
  
  // Filtering states
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<[string, string]>(['', '']);
  const [senderFilter, setSenderFilter] = useState('');
  
  // View states
  const [viewMode, setViewMode] = useState<'list' | 'conversation'>('list');
  const [selectedSmsIds, setSelectedSmsIds] = useState<string[]>([]);

  useEffect(() => {
    fetchSMS();
  }, [activeFolder]);

  const fetchSMS = async () => {
    try {
      const response = await crmAPI.getSMS();
      setSms(response);
    } catch (error: any) {
      console.error('Error fetching SMS:', error);
      toast.error(error.message || 'Failed to load SMS');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSMS();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, sms: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedSms(sms);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSms(null);
  };


  const handleDelete = async () => {
    if (!selectedSms) return;

    try {
      toast.info('Delete functionality coming soon');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete SMS');
    }
    handleMenuClose();
  };

  const handleViewDetails = () => {
    setSmsDetailsOpen(true);
    handleMenuClose();
  };

  const handleReply = () => {
    if (selectedSms) {
      setComposeDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleForward = () => {
    if (selectedSms) {
      setComposeDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleMarkAsRead = async (_smsId: string) => {
    try {
      toast.info('Mark as read functionality coming soon');
    } catch (error) {
      toast.error('Failed to update SMS');
    }
  };

  const handleToggleStar = async (_smsId: string) => {
    try {
      toast.info('Star functionality coming soon');
    } catch (error) {
      toast.error('Failed to update SMS');
    }
  };

  const handleArchive = async (_smsId: string) => {
    try {
      toast.info('Archive functionality coming soon');
    } catch (error) {
      toast.error('Failed to archive SMS');
    }
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setPriorityFilter([]);
    setDateRangeFilter(['', '']);
    setSenderFilter('');
    fetchSMS();
  };

  const getSMSStats = () => {
    const stats = {
      total: sms.length,
      unread: sms.filter(s => s.status === 'unread').length,
      read: sms.filter(s => s.status === 'read').length,
      starred: sms.filter(s => s.isStarred).length,
      archived: sms.filter(s => s.isArchived).length,
      sent: sms.filter(s => s.folder === 'sent').length,
      drafts: sms.filter(s => s.folder === 'drafts').length,
    };
    return stats;
  };

  const getFilteredSMS = () => {
    let filtered = sms;

    if (searchQuery) {
      filtered = filtered.filter(sms => 
        sms.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sms.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sms.to.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter(sms => statusFilter.includes(sms.status));
    }

    if (priorityFilter.length > 0) {
      filtered = filtered.filter(sms => priorityFilter.includes(sms.priority));
    }

    if (senderFilter) {
      filtered = filtered.filter(sms => 
        sms.from.toLowerCase().includes(senderFilter.toLowerCase()) ||
        sms.to.toLowerCase().includes(senderFilter.toLowerCase())
      );
    }

    if (dateRangeFilter[0] && dateRangeFilter[1]) {
      filtered = filtered.filter(sms => {
        const smsDate = new Date(sms.timestamp);
        const startDate = new Date(dateRangeFilter[0]);
        const endDate = new Date(dateRangeFilter[1]);
        return smsDate >= startDate && smsDate <= endDate;
      });
    }

    return filtered;
  };

  const renderListView = () => {
    const filteredSMS = getFilteredSMS();

    return (
      <Card>
        <List>
          {filteredSMS.map((sms) => (
            <ListItem 
              key={sms.id} 
              divider
              sx={{ 
                bgcolor: sms.status === 'unread' ? 'action.hover' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                <Checkbox
                  checked={selectedSmsIds.includes(sms.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSmsIds([...selectedSmsIds, sms.id]);
                    } else {
                      setSelectedSmsIds(selectedSmsIds.filter(id => id !== sms.id));
                    }
                  }}
                />
              </ListItemIcon>
              <ListItemIcon>
                <IconButton onClick={() => handleToggleStar(sms.id)}>
                  {sms.isStarred ? (
                    <Star sx={{ color: 'warning.main' }} />
                  ) : (
                    <StarBorder />
                  )}
                </IconButton>
              </ListItemIcon>
              <MuiListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography 
                      variant="body1" 
                      fontWeight={sms.status === 'unread' ? 'bold' : 'normal'}
                    >
                      {sms.from} → {sms.to}
                    </Typography>
                    {sms.isStarred && (
                      <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                    )}
                    {sms.priority !== 'normal' && (
                      <Chip
                        label={sms.priority}
                        color={priorityColors[sms.priority]}
                        size="small"
                      />
                    )}
                    <Chip
                      label={sms.status}
                      color={smsStatusColors[sms.status]}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {sms.message}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="caption">
                          {format(new Date(sms.timestamp), 'MMM d, h:mm a')}
                        </Typography>
                      </Box>
                      {sms.hasAttachments && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AttachFile fontSize="small" color="action" />
                          <Typography variant="caption">
                            {sms.attachmentCount} attachment(s)
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box display="flex" gap={1}>
                  <Tooltip title="Mark as Read">
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(sms.id)}
                    >
                      <MarkAsUnread />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, sms)}
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

  const renderConversationView = () => {
    const filteredSMS = getFilteredSMS();
    const groupedSMS = filteredSMS.reduce((groups, sms) => {
      const threadId = sms.threadId || sms.id;
      if (!groups[threadId]) {
        groups[threadId] = [];
      }
      groups[threadId].push(sms);
      return groups;
    }, {} as Record<string, any[]>);

    return (
      <Box>
        {Object.entries(groupedSMS).map(([threadId, threadSMS]) => (
          <Accordion key={threadId} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" gap={2} width="100%">
                <Typography variant="h6" fontWeight="bold">
                  {(threadSMS as any[])[0].from} ↔ {(threadSMS as any[])[0].to}
                </Typography>
                <Chip 
                  label={`${(threadSMS as any[]).length} messages`} 
                  size="small" 
                  color="primary"
                />
                <Box display="flex" gap={1} ml="auto">
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date((threadSMS as any[])[0].timestamp), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {(threadSMS as any[]).map((sms: any, index: number) => (
                  <ListItem key={sms.id} divider={index < (threadSMS as any[]).length - 1}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: sms.type === 'sent' ? 'primary.main' : 'success.main' }}>
                        {sms.type === 'sent' ? <Send /> : <Sms />}
                      </Avatar>
                    </ListItemIcon>
                    <MuiListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {sms.from} → {sms.to}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(sms.timestamp), 'h:mm a')}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {sms.message}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <IconButton size="small" onClick={() => handleReply()}>
                          <Reply />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleForward()}>
                          <Forward />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  const stats = getSMSStats();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            SMS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.total} messages • {stats.unread} unread • {stats.starred} starred
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('list')}
            startIcon={<ViewList />}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'conversation' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('conversation')}
            startIcon={<ViewModule />}
          >
            Conversation
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setComposeDialogOpen(true)}
          >
            Send SMS
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
                <Sms sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total SMS
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
                <MarkAsUnread sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.unread}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unread
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
                <Star sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.starred}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Starred
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
                  Sent
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Folder Navigation */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeFolder} onChange={(_, v) => setActiveFolder(v)}>
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Inbox />
                Inbox
                {stats.unread > 0 && (
                  <Badge badgeContent={stats.unread} color="error" />
                )}
              </Box>
            } 
            value="inbox" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Send />
                Sent
              </Box>
            } 
            value="sent" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Drafts />
                Drafts
              </Box>
            } 
            value="drafts" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Star />
                Starred
              </Box>
            } 
            value="starred" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Archive />
                Archived
              </Box>
            } 
            value="archived" 
          />
        </Tabs>
      </Card>

      {/* Search and Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <form onSubmit={handleSearch} style={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search SMS..."
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
                    {['unread', 'read', 'sent', 'delivered', 'failed', 'pending'].map((status) => (
                      <MenuItem key={status} value={status}>
                        <Checkbox checked={statusFilter.indexOf(status) > -1} />
                        <MuiListItemText primary={status} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    multiple
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as string[])}
                    input={<OutlinedInput label="Priority" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {['low', 'normal', 'high', 'urgent'].map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        <Checkbox checked={priorityFilter.indexOf(priority) > -1} />
                        <MuiListItemText primary={priority} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="From/To"
                  value={senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value)}
                />
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
            </Grid>
            <Box mt={2} display="flex" gap={1}>
              <Button size="small" onClick={fetchSMS}>
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
      {viewMode === 'list' ? renderListView() : renderConversationView()}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleReply}>
          <Reply fontSize="small" sx={{ mr: 1 }} /> Reply
        </MenuItem>
        <MenuItem onClick={handleForward}>
          <Forward fontSize="small" sx={{ mr: 1 }} /> Forward
        </MenuItem>
        <MenuItem onClick={() => handleToggleStar(selectedSms?.id)}>
          {selectedSms?.isStarred ? (
            <>
              <Star fontSize="small" sx={{ mr: 1 }} /> Remove Star
            </>
          ) : (
            <>
              <StarBorder fontSize="small" sx={{ mr: 1 }} /> Add Star
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => handleArchive(selectedSms?.id)}>
          <Archive fontSize="small" sx={{ mr: 1 }} /> Archive
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* SMS Details Dialog */}
      <Dialog 
        open={smsDetailsOpen} 
        onClose={() => setSmsDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          {selectedSms && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    SMS Message
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    From: {selectedSms.from} → To: {selectedSms.to}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton onClick={() => handleToggleStar(selectedSms.id)}>
                    {selectedSms.isStarred ? (
                      <Star sx={{ color: 'warning.main' }} />
                    ) : (
                      <StarBorder />
                    )}
                  </IconButton>
                  <IconButton onClick={handleReply}>
                    <Reply />
                  </IconButton>
                  <IconButton onClick={handleForward}>
                    <Forward />
                  </IconButton>
                </Box>
              </Box>

              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                <Tab label="Message" />
                <Tab label="Details" />
                <Tab label="Attachments" />
              </Tabs>

              {activeTab === 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body1" whiteSpace="pre-wrap">
                    {selectedSms.message}
                  </Typography>
                </Paper>
              )}

              {activeTab === 1 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Message Details
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">From: {selectedSms.from}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">To: {selectedSms.to}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2">
                      Time: {format(new Date(selectedSms.timestamp), 'MMM d, yyyy h:mm a')}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2">Status: {selectedSms.status}</Typography>
                  </Box>
                </Paper>
              )}

              {activeTab === 2 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Attachments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No attachments found.
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </Box>
      </Dialog>

      {/* Compose Dialog */}
      <Dialog 
        open={composeDialogOpen} 
        onClose={() => setComposeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Send SMS
          </Typography>
          <Box mt={2}>
            <TextField
              fullWidth
              label="To (Phone Number)"
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Message"
              margin="normal"
              multiline
              rows={6}
              variant="outlined"
              helperText="160 characters max"
            />
            <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
              <Button onClick={() => setComposeDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<Send />}>
                Send SMS
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Delete SMS?
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Are you sure you want to delete this SMS? This action cannot be undone.
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
