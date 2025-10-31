import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Divider,
  CircularProgress,
  Checkbox,
  Badge
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  ViewList,
  ViewModule,
  Refresh,
  Download,
  Upload,
  CheckCircle,
  Cancel,
  Person,
  Assignment,
  Schedule,
  Flag,
  Phone,
  Email
} from '@mui/icons-material';
import { crmAPI } from '../../services/crm-api';
import { toast } from 'react-toastify';

// Define Task type
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'call' | 'email' | 'meeting' | 'follow-up' | 'other';
  assignedTo?: string;
  createdBy?: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  contactId?: string;
  opportunityId?: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...');
      setLoading(true);
      const data = await crmAPI.getTasks();
      console.log('Tasks fetched:', data);
      setTasks(data as any);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesType = filterType === 'all' || task.type === filterType;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  // Group tasks by status for kanban view
  const tasksByStatus = {
    'pending': filteredTasks.filter(t => t.status === 'pending'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    'completed': filteredTasks.filter(t => t.status === 'completed'),
    'cancelled': filteredTasks.filter(t => t.status === 'cancelled')
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'status') setFilterStatus(value);
    if (filter === 'priority') setFilterPriority(value);
    if (filter === 'type') setFilterType(value);
  };

  const handleViewModeChange = (mode: 'list' | 'kanban') => {
    setViewMode(mode);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        await crmAPI.updateTask(taskId, { status: newStatus, completedAt: newStatus === 'completed' ? new Date() as any : null });
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus, completedAt: newStatus === 'completed' ? new Date() : undefined } : t
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleViewDetails = () => {
    if (selectedTask) {
      console.log('View details for:', selectedTask);
      toast.info('View details functionality coming soon');
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedTask) {
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTask) {
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (selectedTask) {
      try {
        await crmAPI.deleteTask(selectedTask.id);
        setTasks(tasks.filter(t => t.id !== selectedTask.id));
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedTask(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'in-progress': return <Assignment />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <Assignment />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low': return <Flag sx={{ color: 'green' }} />;
      case 'medium': return <Flag sx={{ color: 'orange' }} />;
      case 'high': return <Flag sx={{ color: 'red' }} />;
      case 'urgent': return <Flag sx={{ color: 'darkred' }} />;
      default: return <Flag />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone />;
      case 'email': return <Email />;
      case 'meeting': return <Person />;
      case 'follow-up': return <Schedule />;
      default: return <Assignment />;
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading tasks...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTasks}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setEditDialogOpen(true)}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filterPriority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <MenuItem value="all">All Priority</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="call">Call</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="follow-up">Follow-up</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <Box display="flex" gap={1}>
            <Tooltip title="List View">
              <IconButton
                onClick={() => handleViewModeChange('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Kanban View">
              <IconButton
                onClick={() => handleViewModeChange('kanban')}
                color={viewMode === 'kanban' ? 'primary' : 'default'}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Results Summary */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </Typography>
        <Box display="flex" gap={1}>
          <Button size="small" startIcon={<Download />}>
            Export
          </Button>
          <Button size="small" startIcon={<Upload />}>
            Import
          </Button>
        </Box>
      </Box>

      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first task'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setEditDialogOpen(true)}
          >
            Add Task
          </Button>
        </Paper>
      ) : viewMode === 'kanban' ? (
        <Grid container spacing={3}>
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <Grid item xs={12} sm={6} md={3} key={status}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {status.replace('-', ' ')}
                    </Typography>
                    <Badge badgeContent={statusTasks.length} color="primary">
                      <Chip
                        icon={getStatusIcon(status)}
                        label={statusTasks.length}
                        color={getStatusColor(status) as any}
                        size="small"
                      />
                    </Badge>
                  </Box>
                  
                  <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                    {statusTasks.map((task) => (
                      <Card key={task.id} sx={{ mb: 1, cursor: 'pointer' }} 
                            onClick={() => handleMenuClick({ currentTarget: document.createElement('div') } as any, task)}>
                        <CardContent sx={{ p: 2 }}>
                          <Box display="flex" alignItems="flex-start" gap={1}>
                            <Checkbox
                              checked={task.status === 'completed'}
                              onChange={() => handleToggleComplete(task.id)}
                              size="small"
                            />
                            <Box flex={1}>
                              <Typography variant="subtitle2" gutterBottom>
                                {task.title}
                              </Typography>
                              {task.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {task.description}
                                </Typography>
                              )}
                              <Box display="flex" gap={1} flexWrap="wrap">
                                <Chip
                                  icon={getPriorityIcon(task.priority)}
                                  label={task.priority}
                                  color={getPriorityColor(task.priority) as any}
                                  size="small"
                                />
                                <Chip
                                  icon={getTypeIcon(task.type)}
                                  label={task.type}
                                  variant="outlined"
                                  size="small"
                                />
                                {task.dueDate && (
                                  <Chip
                                    label={new Date(task.dueDate).toLocaleDateString()}
                                    color={isOverdue(task.dueDate) ? 'error' : 'default'}
                                    size="small"
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Checkbox
                          checked={task.status === 'completed'}
                          onChange={() => handleToggleComplete(task.id)}
                          size="small"
                        />
                        <Box>
                          <Typography variant="subtitle2">
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography variant="body2" color="text.secondary">
                              {task.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(task.status)}
                        label={task.status.replace('-', ' ')}
                        color={getStatusColor(task.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getPriorityIcon(task.priority)}
                        label={task.priority}
                        color={getPriorityColor(task.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getTypeIcon(task.type)}
                        label={task.type}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <Typography 
                          variant="body2"
                          color={isOverdue(task.dueDate) ? 'error' : 'text.primary'}
                        >
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      ) : (
                        'Not set'
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, task)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTasks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedTask?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Add Task Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Title"
                value={selectedTask?.title || ''}
                onChange={(e) => setSelectedTask(selectedTask ? { ...selectedTask, title: e.target.value } : { id: 'new', title: e.target.value, status: 'pending', priority: 'medium', type: 'other' })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedTask?.status || 'pending'}
                  onChange={(e) => setSelectedTask(selectedTask ? { ...selectedTask, status: e.target.value as any } : null)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={selectedTask?.description || ''}
                onChange={(e) => setSelectedTask(selectedTask ? { ...selectedTask, description: e.target.value } : null)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={selectedTask?.priority || 'medium'}
                  onChange={(e) => setSelectedTask(selectedTask ? { ...selectedTask, priority: e.target.value as any } : null)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedTask?.type || 'other'}
                  onChange={(e) => setSelectedTask(selectedTask ? { ...selectedTask, type: e.target.value as any } : null)}
                >
                  <MenuItem value="call">Call</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="meeting">Meeting</MenuItem>
                  <MenuItem value="follow-up">Follow-up</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={selectedTask?.dueDate ? new Date(selectedTask.dueDate).toISOString().slice(0,10) : ''}
                onChange={(e) => setSelectedTask(selectedTask ? { ...selectedTask, dueDate: e.target.value ? new Date(e.target.value) : undefined } : null)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditDialogOpen(false); setSelectedTask(null); }}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            try {
              if (!selectedTask?.id || selectedTask.id === 'new') {
                const toCreate: any = {
                  title: selectedTask?.title || 'Untitled',
                  description: selectedTask?.description || '',
                  status: selectedTask?.status || 'pending',
                  priority: selectedTask?.priority || 'medium',
                  type: selectedTask?.type || 'other',
                  assignedTo: undefined,
                  dueDate: selectedTask?.dueDate || undefined,
                };
                const created = await crmAPI.createTask(toCreate);
                setTasks([created as any, ...tasks]);
              } else {
                const updates: any = {
                  title: selectedTask.title,
                  description: selectedTask.description,
                  status: selectedTask.status,
                  priority: selectedTask.priority,
                  type: selectedTask.type,
                  dueDate: selectedTask.dueDate || null,
                };
                await crmAPI.updateTask(selectedTask.id, updates);
                setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, ...updates } : t));
              }
              toast.success('Task saved');
              setEditDialogOpen(false);
              setSelectedTask(null);
            } catch(e) {
              toast.error('Failed to save task');
            }
          }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}