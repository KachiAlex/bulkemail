import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Avatar,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Phone,
  Email,
  Business,
  ImportExport
} from '@mui/icons-material';
import { crmAPI } from '../../services/crm-api';
import { Contact } from '../../types/crm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contacts-tabpanel-${index}`}
      aria-labelledby={`contacts-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Form state for creating/editing contacts
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    status: 'new' as Contact['status'],
    category: 'lead' as Contact['category'],
    tags: [] as string[],
    leadScore: 50,
    source: 'manual'
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, statusFilter, categoryFilter]);

  const fetchContacts = async () => {
    try {
      const data = await crmAPI.getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(contact => contact.category === categoryFilter);
    }

    setFilteredContacts(filtered);
  };

  const handleCreateContact = async () => {
    try {
      await crmAPI.createContact(formData);
      setCreateDialogOpen(false);
      resetForm();
      fetchContacts();
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };


  const handleBulkAction = async (action: string) => {
    if (selectedContacts.length === 0) return;

    try {
      switch (action) {
        case 'delete':
          await crmAPI.bulkDeleteContacts(selectedContacts);
          break;
        case 'updateStatus':
          // You can implement bulk status update here
          break;
        case 'addTags':
          // You can implement bulk tag addition here
          break;
      }
      setSelectedContacts([]);
      fetchContacts();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      company: '',
      status: 'new',
      category: 'lead',
      tags: [],
      leadScore: 50,
      source: 'manual'
    });
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'info';
      case 'qualified': return 'success';
      case 'proposal': return 'warning';
      case 'negotiation': return 'secondary';
      case 'closed-won': return 'success';
      case 'closed-lost': return 'error';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: Contact['category']) => {
    switch (category) {
      case 'lead': return 'primary';
      case 'prospect': return 'secondary';
      case 'customer': return 'success';
      case 'partner': return 'warning';
      default: return 'default';
    }
  };

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={2}>
            <Checkbox
              checked={selectedContacts.includes(contact.id)}
              onChange={() => handleSelectContact(contact.id)}
            />
            <Avatar>
              {contact.firstName[0]}{contact.lastName[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {contact.firstName} {contact.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {contact.email}
              </Typography>
              {contact.company && (
                <Typography variant="body2" color="textSecondary">
                  {contact.company} • {contact.jobTitle}
                </Typography>
              )}
              <Box display="flex" gap={1} mt={1}>
                <Chip
                  label={contact.status}
                  size="small"
                  color={getStatusColor(contact.status)}
                />
                <Chip
                  label={contact.category}
                  size="small"
                  color={getCategoryColor(contact.category)}
                  variant="outlined"
                />
                {contact.leadScore && (
                  <Chip
                    label={`Score: ${contact.leadScore}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Call">
              <IconButton size="small">
                <Phone />
              </IconButton>
            </Tooltip>
            <Tooltip title="Email">
              <IconButton size="small">
                <Email />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                // Handle contact selection
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Contacts
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<ImportExport />}
            onClick={() => {/* Handle import */}}
          >
            Import
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add Contact
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="contacted">Contacted</MenuItem>
                  <MenuItem value="qualified">Qualified</MenuItem>
                  <MenuItem value="proposal">Proposal</MenuItem>
                  <MenuItem value="negotiation">Negotiation</MenuItem>
                  <MenuItem value="closed-won">Closed Won</MenuItem>
                  <MenuItem value="closed-lost">Closed Lost</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="lead">Lead</MenuItem>
                  <MenuItem value="prospect">Prospect</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="partner">Partner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {/* Implement advanced filters */}}
              >
                More Filters
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onChange={handleSelectAll}
                  />
                }
                label="Select All"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography>
                {selectedContacts.length} contact(s) selected
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleBulkAction('updateStatus')}
                >
                  Update Status
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleBulkAction('addTags')}
                >
                  Add Tags
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label={`All Contacts (${contacts.length})`} />
            <Tab label={`New (${contacts.filter(c => c.status === 'new').length})`} />
            <Tab label={`Qualified (${contacts.filter(c => c.status === 'qualified').length})`} />
            <Tab label={`Customers (${contacts.filter(c => c.category === 'customer').length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box p={2}>
            {filteredContacts.map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box p={2}>
            {filteredContacts.filter(c => c.status === 'new').map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box p={2}>
            {filteredContacts.filter(c => c.status === 'qualified').map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box p={2}>
            {filteredContacts.filter(c => c.category === 'customer').map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </Box>
        </TabPanel>
      </Card>

      {/* Create Contact Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Contact</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Contact['status'] })}
                  label="Status"
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="contacted">Contacted</MenuItem>
                  <MenuItem value="qualified">Qualified</MenuItem>
                  <MenuItem value="proposal">Proposal</MenuItem>
                  <MenuItem value="negotiation">Negotiation</MenuItem>
                  <MenuItem value="closed-won">Closed Won</MenuItem>
                  <MenuItem value="closed-lost">Closed Lost</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Contact['category'] })}
                  label="Category"
                >
                  <MenuItem value="lead">Lead</MenuItem>
                  <MenuItem value="prospect">Prospect</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="partner">Partner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateContact} variant="contained">Create Contact</Button>
        </DialogActions>
      </Dialog>

      {/* Contact Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Phone sx={{ mr: 1 }} />
          Call
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Email sx={{ mr: 1 }} />
          Email
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Business sx={{ mr: 1 }} />
          Create Opportunity
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
