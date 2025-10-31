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
  Badge,
  Checkbox,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Delete,
  Visibility,
  Star,
  StarBorder,
  Archive,
  Chat as ChatIcon,
  ViewList,
  ViewModule,
  Person,
  Schedule,
  VideoCall,
  Call,
  Group,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const chatStatusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  online: 'success',
  offline: 'default',
  away: 'warning',
  busy: 'error',
  typing: 'primary',
};


export default function Chat() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatDetailsOpen, setChatDetailsOpen] = useState(false);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeFolder, setActiveFolder] = useState('all');
  
  // Filtering states
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<[string, string]>(['', '']);
  const [participantFilter, setParticipantFilter] = useState('');
  
  // View states
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  useEffect(() => {
    fetchChats();
  }, [activeFolder]);

  const fetchChats = async () => {
    try {
      // Mock chat data for now
      const mockChats = [
        {
          id: '1',
          name: 'John Smith',
          lastMessage: 'Thanks for the proposal, I\'ll review it and get back to you.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          unreadCount: 2,
          status: 'online',
          type: 'direct',
          participants: ['user1', 'user2'],
          avatar: 'JS'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          lastMessage: 'The meeting is scheduled for tomorrow at 2 PM.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          unreadCount: 0,
          status: 'away',
          type: 'direct',
          participants: ['user1', 'user3'],
          avatar: 'SJ'
        },
        {
          id: '3',
          name: 'Sales Team',
          lastMessage: 'Mike: Great job on the presentation today!',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          unreadCount: 5,
          status: 'online',
          type: 'group',
          participants: ['user1', 'user2', 'user3', 'user4'],
          avatar: 'ST'
        }
      ];
      setChats(mockChats);
    } catch (error: any) {
      console.error('Error fetching chats:', error);
      toast.error(error.message || 'Failed to load chats');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChats();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, chat: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedChat(chat);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChat(null);
  };


  const handleDelete = async () => {
    if (!selectedChat) return;

    try {
      toast.info('Delete functionality coming soon');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete chat');
    }
    handleMenuClose();
  };

  const handleViewDetails = () => {
    setChatDetailsOpen(true);
    handleMenuClose();
  };

  const handleStartChat = () => {
    if (selectedChat) {
      navigate(`/chat/${selectedChat.id}`);
    }
    handleMenuClose();
  };

  const handleVideoCall = () => {
    if (selectedChat) {
      toast.info('Video call functionality coming soon');
    }
    handleMenuClose();
  };

  const handleVoiceCall = () => {
    if (selectedChat) {
      toast.info('Voice call functionality coming soon');
    }
    handleMenuClose();
  };

  const handleToggleStar = async (_chatId: string) => {
    try {
      toast.info('Star functionality coming soon');
    } catch (error) {
      toast.error('Failed to update chat');
    }
  };

  const handleArchive = async (_chatId: string) => {
    try {
      toast.info('Archive functionality coming soon');
    } catch (error) {
      toast.error('Failed to archive chat');
    }
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setTypeFilter([]);
    setDateRangeFilter(['', '']);
    setParticipantFilter('');
    fetchChats();
  };

  const getChatStats = () => {
    const stats = {
      total: chats.length,
      online: chats.filter(c => c.status === 'online').length,
      offline: chats.filter(c => c.status === 'offline').length,
      starred: chats.filter(c => c.isStarred).length,
      archived: chats.filter(c => c.isArchived).length,
      groups: chats.filter(c => c.type === 'group').length,
      direct: chats.filter(c => c.type === 'direct').length,
    };
    return stats;
  };

  const getFilteredChats = () => {
    let filtered = chats;

    if (searchQuery) {
      filtered = filtered.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.participants.some((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter(chat => statusFilter.includes(chat.status));
    }

    if (typeFilter.length > 0) {
      filtered = filtered.filter(chat => typeFilter.includes(chat.type));
    }

    if (participantFilter) {
      filtered = filtered.filter(chat => 
        chat.participants.some((p: any) => 
          p.name.toLowerCase().includes(participantFilter.toLowerCase())
        )
      );
    }

    if (dateRangeFilter[0] && dateRangeFilter[1]) {
      filtered = filtered.filter(chat => {
        const chatDate = new Date(chat.lastMessageTime);
        const startDate = new Date(dateRangeFilter[0]);
        const endDate = new Date(dateRangeFilter[1]);
        return chatDate >= startDate && chatDate <= endDate;
      });
    }

    return filtered;
  };

  const renderListView = () => {
    const filteredChats = getFilteredChats();

    return (
      <Card>
        <List>
          {filteredChats.map((chat) => (
            <ListItem 
              key={chat.id} 
              divider
              sx={{ 
                bgcolor: chat.unreadCount > 0 ? 'action.hover' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                <Checkbox
                  checked={selectedChats.includes(chat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedChats([...selectedChats, chat.id]);
                    } else {
                      setSelectedChats(selectedChats.filter(id => id !== chat.id));
                    }
                  }}
                />
              </ListItemIcon>
              <ListItemIcon>
                <Box position="relative">
                  <Avatar sx={{ bgcolor: chat.type === 'group' ? 'primary.main' : 'success.main' }}>
                    {chat.type === 'group' ? <Group /> : <Person />}
                  </Avatar>
                  {chat.status === 'online' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        border: '2px solid white',
                      }}
                    />
                  )}
                </Box>
              </ListItemIcon>
              <MuiListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography 
                      variant="body1" 
                      fontWeight={chat.unreadCount > 0 ? 'bold' : 'normal'}
                    >
                      {chat.name}
                    </Typography>
                    {chat.isStarred && (
                      <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                    )}
                    <Chip
                      label={chat.type}
                      color={chat.type === 'group' ? 'primary' : 'success'}
                      size="small"
                    />
                    <Chip
                      label={chat.status}
                      color={chatStatusColors[chat.status]}
                      size="small"
                    />
                    {chat.unreadCount > 0 && (
                      <Badge badgeContent={chat.unreadCount} color="error" />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {chat.lastMessage}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="caption">
                          {format(new Date(chat.lastMessageTime), 'MMM d, h:mm a')}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="caption">
                          {chat.participants.length} participant(s)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box display="flex" gap={1}>
                  <Tooltip title="Start Chat">
                    <IconButton
                      size="small"
                      onClick={() => handleStartChat()}
                    >
                      <Chat />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Voice Call">
                    <IconButton
                      size="small"
                      onClick={() => handleVoiceCall()}
                    >
                      <Call />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Video Call">
                    <IconButton
                      size="small"
                      onClick={() => handleVideoCall()}
                    >
                      <VideoCall />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, chat)}
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

  const renderGridView = () => {
    const filteredChats = getFilteredChats();

    return (
      <Grid container spacing={2}>
        {filteredChats.map((chat) => (
          <Grid item xs={12} sm={6} md={4} key={chat.id}>
            <Card 
              sx={{ 
                p: 2, 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => handleStartChat()}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box position="relative">
                  <Avatar sx={{ bgcolor: chat.type === 'group' ? 'primary.main' : 'success.main' }}>
                    {chat.type === 'group' ? <Group /> : <Person />}
                  </Avatar>
                  {chat.status === 'online' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        border: '2px solid white',
                      }}
                    />
                  )}
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold">
                    {chat.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {chat.participants.length} participant(s)
                  </Typography>
                </Box>
                {chat.isStarred && (
                  <Star sx={{ color: 'warning.main' }} />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" mb={2} noWrap>
                {chat.lastMessage}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Chip
                  label={chat.type}
                  color={chat.type === 'group' ? 'primary' : 'success'}
                  size="small"
                />
                <Chip
                  label={chat.status}
                  color={chatStatusColors[chat.status]}
                  size="small"
                />
                {chat.unreadCount > 0 && (
                  <Badge badgeContent={chat.unreadCount} color="error" />
                )}
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(chat.lastMessageTime), 'MMM d, h:mm a')}
                </Typography>
                <Box ml="auto" display="flex" gap={1}>
                  <IconButton size="small" onClick={(e) => {
                    e.stopPropagation();
                    handleVoiceCall();
                  }}>
                    <Call />
                  </IconButton>
                  <IconButton size="small" onClick={(e) => {
                    e.stopPropagation();
                    handleVideoCall();
                  }}>
                    <VideoCall />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const stats = getChatStats();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Chat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.total} chats • {stats.online} online • {stats.starred} starred
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
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('grid')}
            startIcon={<ViewModule />}
          >
            Grid
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setNewChatDialogOpen(true)}
          >
            New Chat
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
                <ChatIcon sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Chats
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
                <Person sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.online}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Online
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
                  bgcolor: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Group sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.groups}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Groups
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
                <Chat />
                All Chats
              </Box>
            } 
            value="all" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Person />
                Direct
              </Box>
            } 
            value="direct" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Group />
                Groups
              </Box>
            } 
            value="groups" 
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
              placeholder="Search chats..."
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
                    {['online', 'offline', 'away', 'busy', 'typing'].map((status) => (
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
                    {['direct', 'group', 'channel'].map((type) => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={typeFilter.indexOf(type) > -1} />
                        <MuiListItemText primary={type} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Participant"
                  value={participantFilter}
                  onChange={(e) => setParticipantFilter(e.target.value)}
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
              <Button size="small" onClick={fetchChats}>
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
      {viewMode === 'list' ? renderListView() : renderGridView()}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleStartChat}>
          <ChatIcon fontSize="small" sx={{ mr: 1 }} /> Start Chat
        </MenuItem>
        <MenuItem onClick={handleVoiceCall}>
          <Call fontSize="small" sx={{ mr: 1 }} /> Voice Call
        </MenuItem>
        <MenuItem onClick={handleVideoCall}>
          <VideoCall fontSize="small" sx={{ mr: 1 }} /> Video Call
        </MenuItem>
        <MenuItem onClick={() => handleToggleStar(selectedChat?.id)}>
          {selectedChat?.isStarred ? (
            <>
              <Star fontSize="small" sx={{ mr: 1 }} /> Remove Star
            </>
          ) : (
            <>
              <StarBorder fontSize="small" sx={{ mr: 1 }} /> Add Star
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => handleArchive(selectedChat?.id)}>
          <Archive fontSize="small" sx={{ mr: 1 }} /> Archive
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Chat Details Dialog */}
      <Dialog 
        open={chatDetailsOpen} 
        onClose={() => setChatDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          {selectedChat && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedChat.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedChat.type === 'group' ? 'Group Chat' : 'Direct Message'}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton onClick={() => handleToggleStar(selectedChat.id)}>
                    {selectedChat.isStarred ? (
                      <Star sx={{ color: 'warning.main' }} />
                    ) : (
                      <StarBorder />
                    )}
                  </IconButton>
                  <IconButton onClick={handleStartChat}>
                    <Chat />
                  </IconButton>
                  <IconButton onClick={handleVoiceCall}>
                    <Call />
                  </IconButton>
                  <IconButton onClick={handleVideoCall}>
                    <VideoCall />
                  </IconButton>
                </Box>
              </Box>

              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                <Tab label="Participants" />
                <Tab label="Messages" />
                <Tab label="Media" />
              </Tabs>

              {activeTab === 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Participants ({selectedChat.participants.length})
                  </Typography>
                  <List>
                    {selectedChat.participants.map((participant: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Avatar>
                            <Person />
                          </Avatar>
                        </ListItemIcon>
                        <MuiListItemText
                          primary={participant.name}
                          secondary={participant.email}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={participant.status}
                            color={chatStatusColors[participant.status]}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              {activeTab === 1 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Messages
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No messages available.
                  </Typography>
                </Paper>
              )}

              {activeTab === 2 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Shared Media
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No media files found.
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </Box>
      </Dialog>

      {/* New Chat Dialog */}
      <Dialog 
        open={newChatDialogOpen} 
        onClose={() => setNewChatDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Start New Chat
          </Typography>
          <Box mt={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Chat Type</InputLabel>
              <Select
                value="direct"
                input={<OutlinedInput label="Chat Type" />}
              >
                <MenuItem value="direct">Direct Message</MenuItem>
                <MenuItem value="group">Group Chat</MenuItem>
                <MenuItem value="channel">Channel</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Chat Name"
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Participants (comma separated)"
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
            />
            <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
              <Button onClick={() => setNewChatDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<Chat />}>
                Start Chat
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Delete Chat?
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Are you sure you want to delete this chat? This action cannot be undone.
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
