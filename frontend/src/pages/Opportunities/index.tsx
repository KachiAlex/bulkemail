import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
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
  LinearProgress,
  Badge,
  Grid,
  InputAdornment
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
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Info,
  Business,
  Person
} from '@mui/icons-material';
import { crmAPI } from '../../services/crm-api';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/currency';

// Define Opportunity type
interface Opportunity {
  id: string;
  name: string;
  company?: string;
  accountId?: string;
  contactId?: string;
  amount?: number;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost' | 'invoiced';
  probability?: number;
  closeDate?: Date;
  source?: string;
  description?: string;
  assignedTo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define Contact type for dropdown
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
}

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterValue, setFilterValue] = useState('all');
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    name: '',
    company: '',
    description: '',
    amount: '',
    stage: 'new',
    probability: 10,
    closeDate: new Date().toISOString().split('T')[0], // Default to today
    contactId: '',
    source: 'manual'
  });

  // Fetch opportunities
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await crmAPI.getOpportunities();
      setOpportunities(data as any);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts for dropdown
  const fetchContacts = async () => {
    try {
      const data = await crmAPI.getContacts();
      setContacts(data as any);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contacts');
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchContacts();
  }, []);

  // Populate form when editing an opportunity
  useEffect(() => {
    if (selectedOpportunity) {
      setNewOpportunity({
        name: selectedOpportunity.name || '',
        company: selectedOpportunity.company || '',
        description: selectedOpportunity.description || '',
        amount: selectedOpportunity.amount?.toString() || '',
        stage: selectedOpportunity.stage || 'new',
        probability: selectedOpportunity.probability || 10,
        closeDate: selectedOpportunity.closeDate ? 
          new Date(selectedOpportunity.closeDate).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        contactId: selectedOpportunity.contactId || '',
        source: selectedOpportunity.source || 'manual'
      });
    } else {
      // Reset form for new opportunity
      setNewOpportunity({
        name: '',
        company: '',
        description: '',
        amount: '',
        stage: 'new',
        probability: 10,
        closeDate: new Date().toISOString().split('T')[0], // Default to today
        contactId: '',
        source: 'manual'
      });
    }
  }, [selectedOpportunity]);

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = filterStage === 'all' || opportunity.stage === filterStage;
    
    let matchesValue = true;
    if (filterValue !== 'all') {
      const amount = opportunity.amount || 0;
      switch (filterValue) {
        case 'small': matchesValue = amount < 10000; break;
        case 'medium': matchesValue = amount >= 10000 && amount < 50000; break;
        case 'large': matchesValue = amount >= 50000; break;
      }
    }
    
    return matchesSearch && matchesStage && matchesValue;
  });

  // Group opportunities by stage for pipeline view
  const opportunitiesByStage = {
    'new': filteredOpportunities.filter(o => o.stage === 'new'),
    'contacted': filteredOpportunities.filter(o => o.stage === 'contacted'),
    'qualified': filteredOpportunities.filter(o => o.stage === 'qualified'),
    'proposal': filteredOpportunities.filter(o => o.stage === 'proposal'),
    'negotiation': filteredOpportunities.filter(o => o.stage === 'negotiation'),
    'closed-won': filteredOpportunities.filter(o => o.stage === 'closed-won'),
    'closed-lost': filteredOpportunities.filter(o => o.stage === 'closed-lost'),
    'invoiced': filteredOpportunities.filter(o => o.stage === 'invoiced')
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'stage') setFilterStage(value);
    if (filter === 'value') setFilterValue(value);
  };

  const handleViewModeChange = (mode: 'pipeline' | 'list') => {
    setViewMode(mode);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, opportunity: Opportunity) => {
    setAnchorEl(event.currentTarget);
    setSelectedOpportunity(opportunity);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOpportunity(null);
  };

  const handleViewDetails = () => {
    if (selectedOpportunity) {
      console.log('View details for:', selectedOpportunity);
      toast.info('View details functionality coming soon');
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedOpportunity) {
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedOpportunity) {
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  // Handle add new opportunity
  const handleAddOpportunity = async () => {
    try {
      const opportunityData = {
        ...newOpportunity,
        amount: parseFloat(newOpportunity.amount) || 0,
        probability: newOpportunity.probability,
        closeDate: newOpportunity.closeDate ? new Date(newOpportunity.closeDate) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const created = await crmAPI.createOpportunity(opportunityData as any);
      setOpportunities([...opportunities, created as any]);
      
      // Reset form
      setNewOpportunity({
        name: '',
        company: '',
        description: '',
        amount: '',
        stage: 'new',
        probability: 10,
        closeDate: new Date().toISOString().split('T')[0], // Default to today
        contactId: '',
        source: 'manual'
      });
      
      setEditDialogOpen(false);
      toast.success('Opportunity created successfully');
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('Failed to create opportunity');
    }
  };

  // Handle edit opportunity
  const handleEditOpportunity = async () => {
    if (!selectedOpportunity) return;
    
    try {
      const updatedData = {
        ...selectedOpportunity,
        ...newOpportunity,
        amount: parseFloat(newOpportunity.amount) || 0,
        probability: newOpportunity.probability,
        closeDate: newOpportunity.closeDate ? new Date(newOpportunity.closeDate) : new Date(),
        updatedAt: new Date()
      };

      // TODO: Implement updateOpportunity in crmAPI
      setOpportunities(opportunities.map(opp => 
        opp.id === selectedOpportunity.id ? { ...opp, ...updatedData } as any : opp
      ));
      
      setEditDialogOpen(false);
      setSelectedOpportunity(null);
      toast.success('Opportunity updated successfully');
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast.error('Failed to update opportunity');
    }
  };


  const handleConfirmDelete = async () => {
    if (selectedOpportunity) {
      try {
        // TODO: Implement deleteOpportunity in crmAPI
        toast.info('Delete opportunity functionality coming soon');
        setOpportunities(opportunities.filter(o => o.id !== selectedOpportunity.id));
      } catch (error) {
        console.error('Error deleting opportunity:', error);
        toast.error('Failed to delete opportunity');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedOpportunity(null);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'info';
      case 'contacted': return 'warning';
      case 'qualified': return 'primary';
      case 'proposal': return 'secondary';
      case 'negotiation': return 'warning';
      case 'closed-won': return 'success';
      case 'closed-lost': return 'error';
      case 'invoiced': return 'success';
      default: return 'default';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'new': return <Info />;
      case 'contacted': return <Person />;
      case 'qualified': return <CheckCircle />;
      case 'proposal': return <Business />;
      case 'negotiation': return <Warning />;
      case 'closed-won': return <TrendingUp />;
      case 'closed-lost': return <TrendingDown />;
      case 'invoiced': return <CheckCircle />;
      default: return <Business />;
    }
  };

  // Remove the local formatCurrency function - now using global utility

  const getTotalValue = (stage: string) => {
    return opportunitiesByStage[stage as keyof typeof opportunitiesByStage]
      .reduce((sum, opp) => sum + (opp.amount || 0), 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading opportunities...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Opportunities
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchOpportunities}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setEditDialogOpen(true)}
          >
            Add Opportunity
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search opportunities..."
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
            <InputLabel>Stage</InputLabel>
            <Select
              value={filterStage}
              onChange={(e) => handleFilterChange('stage', e.target.value)}
            >
              <MenuItem value="all">All Stages</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="contacted">Contacted</MenuItem>
              <MenuItem value="qualified">Qualified</MenuItem>
              <MenuItem value="proposal">Proposal</MenuItem>
              <MenuItem value="negotiation">Negotiation</MenuItem>
              <MenuItem value="closed-won">Closed Won</MenuItem>
              <MenuItem value="closed-lost">Closed Lost</MenuItem>
              <MenuItem value="invoiced">Invoiced</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Value</InputLabel>
            <Select
              value={filterValue}
              onChange={(e) => handleFilterChange('value', e.target.value)}
            >
              <MenuItem value="all">All Values</MenuItem>
              <MenuItem value="small">Small (&lt; $10K)</MenuItem>
              <MenuItem value="medium">Medium ($10K - $50K)</MenuItem>
              <MenuItem value="large">Large (&gt; $50K)</MenuItem>
            </Select>
          </FormControl>

          <Box display="flex" gap={1}>
            <Tooltip title="Pipeline View">
              <IconButton
                onClick={() => handleViewModeChange('pipeline')}
                color={viewMode === 'pipeline' ? 'primary' : 'default'}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
            <Tooltip title="List View">
              <IconButton
                onClick={() => handleViewModeChange('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Results Summary */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredOpportunities.length} of {opportunities.length} opportunities
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

      {/* Opportunities Display */}
      {filteredOpportunities.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No opportunities found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm || filterStage !== 'all' || filterValue !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first opportunity'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setEditDialogOpen(true)}
          >
            Add Opportunity
          </Button>
        </Paper>
      ) : viewMode === 'pipeline' ? (
        <Grid container spacing={3}>
          {Object.entries(opportunitiesByStage).map(([stage, stageOpportunities]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={stage}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {stage.replace('-', ' ')}
                    </Typography>
                    <Badge badgeContent={stageOpportunities.length} color="primary">
                      <Chip
                        icon={getStageIcon(stage)}
                        label={stageOpportunities.length}
                        color={getStageColor(stage) as any}
                        size="small"
                      />
                    </Badge>
                  </Box>
                  
                  <Typography variant="h5" color="primary" gutterBottom>
                    {formatCurrency(getTotalValue(stage))}
                  </Typography>
                  
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {stageOpportunities.map((opportunity) => (
                      <Card key={opportunity.id} sx={{ mb: 1, cursor: 'pointer' }} 
                            onClick={() => handleMenuClick({ currentTarget: document.createElement('div') } as any, opportunity)}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {opportunity.name}
                          </Typography>
                          {opportunity.company && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {opportunity.company}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(opportunity.amount || 0)}
                          </Typography>
                          {opportunity.probability && (
                            <Box mt={1}>
                              <LinearProgress 
                                variant="determinate" 
                                value={opportunity.probability} 
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {opportunity.probability}% probability
                              </Typography>
                            </Box>
                          )}
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
                <TableCell>Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Probability</TableCell>
                <TableCell>Close Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOpportunities
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((opportunity) => (
                  <TableRow key={opportunity.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {opportunity.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {opportunity.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {opportunity.company || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStageIcon(opportunity.stage)}
                        label={opportunity.stage.replace('-', ' ')}
                        color={getStageColor(opportunity.stage) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {formatCurrency(opportunity.amount || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress 
                          variant="determinate" 
                          value={opportunity.probability || 0} 
                          sx={{ width: 60, height: 6 }}
                        />
                        <Typography variant="body2">
                          {opportunity.probability || 0}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {opportunity.closeDate ? 
                        new Date(opportunity.closeDate).toLocaleDateString() : 
                        'Not set'
                      }
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, opportunity)}
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
            count={filteredOpportunities.length}
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
        <DialogTitle>Delete Opportunity</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedOpportunity?.name}"?
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

      {/* Edit/Add Opportunity Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Opportunity Name *"
                  value={newOpportunity.name}
                  onChange={(e) => setNewOpportunity({...newOpportunity, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={newOpportunity.company}
                  onChange={(e) => setNewOpportunity({...newOpportunity, company: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newOpportunity.description}
                  onChange={(e) => setNewOpportunity({...newOpportunity, description: e.target.value})}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount ($)"
                  type="number"
                  value={newOpportunity.amount}
                  onChange={(e) => setNewOpportunity({...newOpportunity, amount: e.target.value})}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Stage</InputLabel>
                  <Select
                    value={newOpportunity.stage}
                    onChange={(e) => setNewOpportunity({...newOpportunity, stage: e.target.value})}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="contacted">Contacted</MenuItem>
                    <MenuItem value="qualified">Qualified</MenuItem>
                    <MenuItem value="proposal">Proposal</MenuItem>
                    <MenuItem value="negotiation">Negotiation</MenuItem>
                    <MenuItem value="closed-won">Closed Won</MenuItem>
                    <MenuItem value="closed-lost">Closed Lost</MenuItem>
                    <MenuItem value="invoiced">Invoiced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Probability (%)"
                  type="number"
                  value={newOpportunity.probability}
                  onChange={(e) => setNewOpportunity({...newOpportunity, probability: parseInt(e.target.value) || 0})}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Close Date"
                  type="date"
                  value={newOpportunity.closeDate}
                  onChange={(e) => setNewOpportunity({...newOpportunity, closeDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Contact</InputLabel>
                  <Select
                    value={newOpportunity.contactId}
                    onChange={(e) => setNewOpportunity({...newOpportunity, contactId: e.target.value})}
                    label="Contact"
                  >
                    <MenuItem value="">
                      <em>Select a contact</em>
                    </MenuItem>
                    {contacts.map((contact) => (
                      <MenuItem key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName} {contact.company ? `(${contact.company})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={newOpportunity.source}
                    onChange={(e) => setNewOpportunity({...newOpportunity, source: e.target.value})}
                  >
                    <MenuItem value="manual">Manual Entry</MenuItem>
                    <MenuItem value="website">Website</MenuItem>
                    <MenuItem value="referral">Referral</MenuItem>
                    <MenuItem value="email">Email Campaign</MenuItem>
                    <MenuItem value="phone">Phone Call</MenuItem>
                    <MenuItem value="social">Social Media</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={selectedOpportunity ? handleEditOpportunity : handleAddOpportunity}
            disabled={!newOpportunity.name.trim()}
          >
            {selectedOpportunity ? 'Update' : 'Create'} Opportunity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}