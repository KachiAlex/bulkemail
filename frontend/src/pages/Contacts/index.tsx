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
  Avatar,
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
  Checkbox
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
  Person,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Label,
  List
} from '@mui/icons-material';
import { crmAPI } from '../../services/crm-api';
import { toast } from 'react-toastify';

// Define Contact type locally since the import path doesn't exist
interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>(['VIP', 'Hot Lead', 'Cold Lead', 'Customer', 'Prospect', 'Follow-up', 'Do Not Contact']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Contact Lists Management
  const [contactLists, setContactLists] = useState<{id: string, name: string, description?: string, contactCount: number}[]>([
    { id: '1', name: 'Newsletter Subscribers', description: 'Monthly newsletter recipients', contactCount: 0 },
    { id: '2', name: 'VIP Customers', description: 'High-value customers', contactCount: 0 },
    { id: '3', name: 'Prospects', description: 'Potential customers', contactCount: 0 },
    { id: '4', name: 'Event Attendees', description: 'Conference and event participants', contactCount: 0 }
  ]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    status: 'new',
    category: 'individual',
    contactList: ''
  });

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      console.log('Fetching contacts...');
      setLoading(true);
      const data = await crmAPI.getContacts();
      console.log('Contacts fetched:', data);
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Filter contacts based on search and filters
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || contact.category === filterCategory;
    const matchesContactCategory = selectedCategory === 'all' || (contact as any).contactCategory === selectedCategory;
    
    // Tag filtering
    const matchesTags = tagFilter.length === 0 || tagFilter.some(tag => 
      (contact as any).tags?.includes(tag)
    );
    
    // Contact list filtering
    const matchesList = !selectedList || (contact as any).contactList === selectedList;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesContactCategory && matchesTags && matchesList;
  });

  // Handle select all contacts
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  // Handle individual contact selection
  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      for (const contactId of selectedContacts) {
        await crmAPI.deleteContact(contactId);
      }
      setContacts(contacts.filter(contact => !selectedContacts.includes(contact.id)));
      setSelectedContacts([]);
      setBulkDeleteDialogOpen(false);
      toast.success(`${selectedContacts.length} contacts deleted successfully`);
    } catch (error) {
      console.error('Error deleting contacts:', error);
      toast.error('Failed to delete contacts');
    }
  };

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle tag operations
  const handleAddTag = (tag: string) => {
    if (tag && !availableTags.includes(tag)) {
      setAvailableTags([...availableTags, tag]);
    }
  };

  const handleTagContact = async (contactId: string, tags: string[]) => {
    try {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        const updatedContact = { ...contact, tags };
        await crmAPI.updateContact(contactId, updatedContact as any);
        setContacts(contacts.map(c => c.id === contactId ? updatedContact : c));
        toast.success('Tags updated successfully');
      }
    } catch (error) {
      console.error('Error updating tags:', error);
      toast.error('Failed to update tags');
    }
  };

  const handleBulkTag = async (tags: string[]) => {
    try {
      for (const contactId of selectedContacts) {
        await handleTagContact(contactId, tags);
      }
      setSelectedContacts([]);
      setTagDialogOpen(false);
      toast.success(`Tags applied to ${selectedContacts.length} contacts`);
    } catch (error) {
      console.error('Error applying tags:', error);
      toast.error('Failed to apply tags');
    }
  };

  const handleTagFilter = (tag: string) => {
    if (tagFilter.includes(tag)) {
      setTagFilter(tagFilter.filter(t => t !== tag));
    } else {
      setTagFilter([...tagFilter, tag]);
    }
  };

  // Contact List Management
  const handleCreateList = () => {
    if (newListName.trim()) {
      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        description: newListDescription.trim(),
        contactCount: 0
      };
      setContactLists([...contactLists, newList]);
      setNewListName('');
      setNewListDescription('');
      setListDialogOpen(false);
      toast.success(`Contact list "${newListName}" created successfully`);
    }
  };

  const handleAssignToList = async (contactIds: string[], listId: string) => {
    try {
      // Update contacts with the selected list
      for (const contactId of contactIds) {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
          const updatedContact = { ...contact, contactList: listId };
          await crmAPI.updateContact(contactId, updatedContact as any);
          setContacts(contacts.map(c => c.id === contactId ? updatedContact : c));
        }
      }
      
      // Update list contact count
      setContactLists(lists => lists.map(list => 
        list.id === listId 
          ? { ...list, contactCount: list.contactCount + contactIds.length }
          : list
      ));
      
      toast.success(`${contactIds.length} contact(s) assigned to list`);
    } catch (error) {
      console.error('Error assigning contacts to list:', error);
      toast.error('Failed to assign contacts to list');
    }
  };

  const handleListFilter = (listId: string) => {
    setSelectedList(listId === selectedList ? '' : listId);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'status') setFilterStatus(value);
    if (filter === 'category') setFilterCategory(value);
  };

  const handleViewModeChange = (mode: 'list' | 'grid') => {
    setViewMode(mode);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, contact: Contact) => {
    setAnchorEl(event.currentTarget);
    setSelectedContact(contact);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContact(null);
  };

  const handleViewDetails = () => {
    if (selectedContact) {
      console.log('View details for:', selectedContact);
      toast.info('View details functionality coming soon');
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedContact) {
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedContact) {
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (selectedContact) {
      try {
        await crmAPI.deleteContact(selectedContact.id);
        setContacts(contacts.filter(c => c.id !== selectedContact.id));
        toast.success('Contact deleted successfully');
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('Failed to delete contact');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedContact(null);
  };


  // Handle Add Contact
  const handleAddContact = async () => {
    try {
      if (!newContact.firstName || !newContact.lastName || !newContact.email) {
        toast.error('Please fill in required fields (First Name, Last Name, Email)');
        return;
      }
      
      const created = await crmAPI.createContact({
        ...newContact,
        status: newContact.status as any,
        category: newContact.category as any,
        tags: [],
        source: 'manual'
      });
      setContacts([...contacts, created]);
      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        status: 'new',
        category: 'individual',
        contactList: ''
      });
      setEditDialogOpen(false);
      toast.success('Contact added successfully');
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact');
    }
  };

  // Handle CSV Export
  const handleExport = () => {
    const csvContent = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title', 'Status', 'Category'],
      ...contacts.map(contact => [
        contact.firstName || '',
        contact.lastName || '',
        contact.email || '',
        contact.phone || '',
        contact.company || '',
        (contact as any).jobTitle || '',
        contact.status || '',
        contact.category || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Contacts exported successfully');
  };

  // Handle CSV Import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        // const headers = lines[0].split(',').map(h => h.trim());
        
        const importedContacts = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const contact = {
              firstName: values[0] || '',
              lastName: values[1] || '',
              email: values[2] || '',
              phone: values[3] || '',
              company: values[4] || '',
              jobTitle: values[5] || '',
              status: (values[6] || 'new') as any,
              category: (values[7] || 'individual') as any,
              tags: [],
              source: 'import'
            };
            
            if (contact.firstName && contact.lastName && contact.email) {
              try {
                const created = await crmAPI.createContact(contact);
                importedContacts.push(created);
              } catch (error) {
                console.error('Error importing contact:', contact.email, error);
              }
            }
          }
        }
        
        setContacts([...contacts, ...importedContacts]);
        toast.success(`${importedContacts.length} contacts imported successfully`);
        setImportDialogOpen(false);
      } catch (error) {
        console.error('Error processing CSV:', error);
        toast.error('Failed to import contacts');
      }
    };
    reader.readAsText(file);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'lead': return 'warning';
      case 'customer': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'inactive': return <Cancel />;
      case 'lead': return <Warning />;
      case 'customer': return <Info />;
      default: return <Person />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading contacts...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Contacts
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchContacts}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setEditDialogOpen(true)}
          >
            Add Contact
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search contacts..."
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
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
              <MenuItem value="customer">Customer</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="individual">Individual</MenuItem>
              <MenuItem value="business">Business</MenuItem>
              <MenuItem value="enterprise">Enterprise</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Contact Group</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <MenuItem value="all">All Groups</MenuItem>
              <MenuItem value="imported">Imported</MenuItem>
              <MenuItem value="manual">Manual</MenuItem>
              <MenuItem value="campaign">Campaign</MenuItem>
              <MenuItem value="referral">Referral</MenuItem>
            </Select>
          </FormControl>

          {/* Contact Lists Filter */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Contact List</InputLabel>
            <Select
              value={selectedList}
              onChange={(e) => handleListFilter(e.target.value)}
            >
              <MenuItem value="">All Lists</MenuItem>
              {contactLists.map(list => (
                <MenuItem key={list.id} value={list.id}>
                  {list.name} ({list.contactCount})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Tag Filter */}
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Filter by Tags:</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableTags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  color={tagFilter.includes(tag) ? 'primary' : 'default'}
                  onClick={() => handleTagFilter(tag)}
                  variant={tagFilter.includes(tag) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <Tooltip title="List View">
              <IconButton
                onClick={() => handleViewModeChange('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Grid View">
              <IconButton
                onClick={() => handleViewModeChange('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Bulk Actions Toolbar */}
      {selectedContacts.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: 'primary.light', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body1">
              {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                size="small"
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
                onClick={() => setSelectedContacts([])}
              >
                Clear Selection
              </Button>
              <Button
                size="small"
                variant="contained"
                sx={{ backgroundColor: 'secondary.main', color: 'white' }}
                startIcon={<Label />}
                onClick={() => setTagDialogOpen(true)}
              >
                Tag Selected
              </Button>
              <Button
                size="small"
                variant="contained"
                sx={{ backgroundColor: 'success.main', color: 'white' }}
                startIcon={<List />}
                onClick={() => setListDialogOpen(true)}
              >
                Assign to List
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                Delete Selected
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Results Summary */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredContacts.length} of {contacts.length} contacts
        </Typography>
        <Box display="flex" gap={1}>
          <Button size="small" startIcon={<Download />} onClick={handleExport}>
            Export
          </Button>
          <Button size="small" startIcon={<Upload />} onClick={() => setImportDialogOpen(true)}>
            Import
          </Button>
          <Button size="small" startIcon={<List />} onClick={() => setListDialogOpen(true)}>
            Create List
          </Button>
        </Box>
      </Box>

      {/* Contacts List/Grid */}
      {filteredContacts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No contacts found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first contact'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setEditDialogOpen(true)}
          >
            Add Contact
          </Button>
        </Paper>
      ) : viewMode === 'list' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedContacts.length > 0 && selectedContacts.length < filteredContacts.length}
                    checked={filteredContacts.length > 0 && selectedContacts.length === filteredContacts.length}
                    onChange={(e: any) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((contact) => (
                  <TableRow key={contact.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onChange={(e: any) => handleSelectContact(contact.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar>
                          {contact.firstName?.[0]}{contact.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {contact.firstName} {contact.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {contact.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(contact.status || '')}
                        label={contact.status}
                        color={getStatusColor(contact.status || '') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contact.category}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {(contact as any).tags?.map((tag: string) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )) || <Typography variant="body2" color="text.secondary">No tags</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, contact)}
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
            count={filteredContacts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      ) : (
        <Grid container spacing={3}>
          {filteredContacts.map((contact) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={contact.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Avatar sx={{ width: 48, height: 48 }}>
                      {contact.firstName?.[0]}{contact.lastName?.[0]}
                    </Avatar>
                    <IconButton
                      onClick={(e) => handleMenuClick(e, contact)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {contact.firstName} {contact.lastName}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {contact.email}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {contact.company}
                  </Typography>
                  
                  <Box display="flex" gap={1} mt={2}>
                    <Chip
                      icon={getStatusIcon(contact.status || '')}
                      label={contact.status}
                      color={getStatusColor(contact.status || '') as any}
                      size="small"
                    />
                    <Chip
                      label={contact.category}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </CardContent>
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
        <MenuItem onClick={() => {
          setSelectedContacts([selectedContact?.id || '']);
          setTagDialogOpen(true);
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <Label />
          </ListItemIcon>
          <ListItemText>Tag Contact</ListItemText>
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
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedContact?.firstName} {selectedContact?.lastName}?
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

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onClose={() => setBulkDeleteDialogOpen(false)}>
        <DialogTitle>Delete Selected Contacts</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedContacts.length} selected contact{selectedContacts.length > 1 ? 's' : ''}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkDelete} color="error" variant="contained">
            Delete All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact List Assignment Dialog */}
      <Dialog open={listDialogOpen} onClose={() => setListDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedContacts.length > 1 ? 'Assign Selected Contacts to List' : 'Create New Contact List'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedContacts.length > 0 ? (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Select a contact list to assign {selectedContacts.length} contact(s) to:
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Contact List</InputLabel>
                  <Select
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                  >
                    {contactLists.map(list => (
                      <MenuItem key={list.id} value={list.id}>
                        {list.name} ({list.contactCount} contacts)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                  Or create a new list:
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" gutterBottom>
                Create a new contact list for organizing your contacts:
              </Typography>
            )}
            
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="List Name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Newsletter Subscribers"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description (Optional)"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Brief description of this contact list"
                multiline
                rows={2}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setListDialogOpen(false);
            setNewListName('');
            setNewListDescription('');
            setSelectedList('');
          }}>
            Cancel
          </Button>
          {selectedContacts.length > 0 && selectedList ? (
            <Button 
              onClick={() => handleAssignToList(selectedContacts, selectedList)} 
              variant="contained"
            >
              Assign to List
            </Button>
          ) : (
            <Button 
              onClick={handleCreateList} 
              variant="contained"
              disabled={!newListName.trim()}
            >
              Create List
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Tag {selectedContacts.length > 1 ? 'Selected Contacts' : 'Contact'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Select tags to apply to {selectedContacts.length > 1 ? 'selected contacts' : 'this contact'}:
            </Typography>
            
            {/* Available Tags */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Available Tags:</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {availableTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    color={selectedTags.includes(tag) ? 'primary' : 'default'}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>

            {/* Add New Tag */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Add New Tag:</Typography>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  placeholder="Enter new tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      handleAddTag(newTag.trim());
                      setNewTag('');
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (newTag.trim()) {
                      handleAddTag(newTag.trim());
                      setNewTag('');
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setTagDialogOpen(false);
            setSelectedTags([]);
            setNewTag('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleBulkTag(selectedTags)} 
            variant="contained"
            disabled={selectedTags.length === 0}
          >
            Apply Tags
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Add Contact Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedContact ? 'Edit Contact' : 'Add New Contact'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={newContact.firstName}
                  onChange={(e) => setNewContact({...newContact, firstName: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={newContact.lastName}
                  onChange={(e) => setNewContact({...newContact, lastName: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={newContact.company}
                  onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  value={newContact.jobTitle}
                  onChange={(e) => setNewContact({...newContact, jobTitle: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newContact.status}
                    onChange={(e) => setNewContact({...newContact, status: e.target.value})}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="lead">Lead</MenuItem>
                    <MenuItem value="customer">Customer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newContact.category}
                    onChange={(e) => setNewContact({...newContact, category: e.target.value})}
                  >
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="business">Business</MenuItem>
                    <MenuItem value="enterprise">Enterprise</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Contact List (Optional)</InputLabel>
                  <Select
                    value={newContact.contactList}
                    onChange={(e) => setNewContact({...newContact, contactList: e.target.value})}
                  >
                    <MenuItem value="">No List</MenuItem>
                    {contactLists.map(list => (
                      <MenuItem key={list.id} value={list.id}>
                        {list.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddContact}>
            {selectedContact ? 'Update' : 'Add Contact'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Contacts</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a CSV file with the following columns: First Name, Last Name, Email, Phone, Company, Job Title, Status, Category
          </Typography>
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            style={{ display: 'none' }}
            id="csv-import"
          />
          <label htmlFor="csv-import">
            <Button variant="outlined" component="span" startIcon={<Upload />} fullWidth>
              Choose CSV File
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}