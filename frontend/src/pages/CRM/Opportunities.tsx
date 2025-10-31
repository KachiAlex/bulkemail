import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  TextField,
  LinearProgress
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Phone,
  Email,
  Business,
} from '@mui/icons-material';
import { crmAPI } from '../../services/crm-api';
import { Opportunity, Contact, Account } from '../../types/crm';

interface PipelineStage {
  id: string;
  name: string;
  opportunities: Opportunity[];
  totalValue: number;
  count: number;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Form state for creating/editing opportunities
  const [formData, setFormData] = useState({
    name: '',
    accountId: '',
    contactId: '',
    stage: 'prospecting' as Opportunity['stage'],
    value: 0,
    probability: 0,
    expectedCloseDate: '',
    description: '',
    source: ''
  });

  const pipelineStages: PipelineStage[] = [
    {
      id: 'prospecting',
      name: 'Prospecting',
      opportunities: opportunities.filter(o => o.stage === 'prospecting'),
      totalValue: opportunities.filter(o => o.stage === 'prospecting').reduce((sum, o) => sum + o.value, 0),
      count: opportunities.filter(o => o.stage === 'prospecting').length
    },
    {
      id: 'qualification',
      name: 'Qualification',
      opportunities: opportunities.filter(o => o.stage === 'qualification'),
      totalValue: opportunities.filter(o => o.stage === 'qualification').reduce((sum, o) => sum + o.value, 0),
      count: opportunities.filter(o => o.stage === 'qualification').length
    },
    {
      id: 'proposal',
      name: 'Proposal',
      opportunities: opportunities.filter(o => o.stage === 'proposal'),
      totalValue: opportunities.filter(o => o.stage === 'proposal').reduce((sum, o) => sum + o.value, 0),
      count: opportunities.filter(o => o.stage === 'proposal').length
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      opportunities: opportunities.filter(o => o.stage === 'negotiation'),
      totalValue: opportunities.filter(o => o.stage === 'negotiation').reduce((sum, o) => sum + o.value, 0),
      count: opportunities.filter(o => o.stage === 'negotiation').length
    },
    {
      id: 'closed-won',
      name: 'Closed Won',
      opportunities: opportunities.filter(o => o.stage === 'closed-won'),
      totalValue: opportunities.filter(o => o.stage === 'closed-won').reduce((sum, o) => sum + o.value, 0),
      count: opportunities.filter(o => o.stage === 'closed-won').length
    },
    {
      id: 'closed-lost',
      name: 'Closed Lost',
      opportunities: opportunities.filter(o => o.stage === 'closed-lost'),
      totalValue: opportunities.filter(o => o.stage === 'closed-lost').reduce((sum, o) => sum + o.value, 0),
      count: opportunities.filter(o => o.stage === 'closed-lost').length
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [opportunitiesData, contactsData, accountsData] = await Promise.all([
        crmAPI.getOpportunities(),
        crmAPI.getContacts(),
        crmAPI.getAccounts()
      ]);
      setOpportunities(opportunitiesData);
      setContacts(contactsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpportunity = async () => {
    try {
      await crmAPI.createOpportunity({
        ...formData,
        expectedCloseDate: new Date(formData.expectedCloseDate),
        actualCloseDate: undefined
      });
      setCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating opportunity:', error);
    }
  };


  const resetForm = () => {
    setFormData({
      name: '',
      accountId: '',
      contactId: '',
      stage: 'prospecting',
      value: 0,
      probability: 0,
      expectedCloseDate: '',
      description: '',
      source: ''
    });
  };

  const getStageColor = (stage: Opportunity['stage']) => {
    switch (stage) {
      case 'prospecting': return 'default';
      case 'qualification': return 'info';
      case 'proposal': return 'warning';
      case 'negotiation': return 'secondary';
      case 'closed-won': return 'success';
      case 'closed-lost': return 'error';
      default: return 'default';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'success';
    if (probability >= 50) return 'warning';
    return 'error';
  };

  const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => {
    const contact = contacts.find(c => c.id === opportunity.contactId);
    const account = accounts.find(a => a.id === opportunity.accountId);

    return (
      <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={() => {/* Handle opportunity selection */}}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Typography variant="h6" gutterBottom>
                {opportunity.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {account?.name || 'No Account'} • {contact ? `${contact.firstName} ${contact.lastName}` : 'No Contact'}
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={opportunity.stage}
                  size="small"
                  color={getStageColor(opportunity.stage)}
                />
                <Chip
                  label={`${opportunity.probability}%`}
                  size="small"
                  color={getProbabilityColor(opportunity.probability)}
                  variant="outlined"
                />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="primary">
                  ${opportunity.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Due: {opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString() : 'No date'}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setAnchorEl(e.currentTarget);
                // Handle opportunity selection
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const StageColumn = ({ stage }: { stage: PipelineStage }) => (
    <Box>
      <Card sx={{ mb: 2, bgcolor: 'grey.50' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{stage.name}</Typography>
            <Box display="flex" gap={1}>
              <Chip label={`${stage.count}`} size="small" />
              <Chip 
                label={`$${stage.totalValue.toLocaleString()}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
      {stage.opportunities.map(opportunity => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
      ))}
    </Box>
  );

  if (loading) {
    return (
      <Box p={3}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Sales Pipeline
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Opportunity
        </Button>
      </Box>

      {/* Pipeline Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pipeline Overview
          </Typography>
          <Grid container spacing={2}>
            {pipelineStages.map(stage => (
              <Grid item xs={12} sm={6} md={2} key={stage.id}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {stage.count}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stage.name}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${stage.totalValue.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
      <Grid container spacing={2}>
        {pipelineStages.map(stage => (
          <Grid item xs={12} md={2} key={stage.id}>
            <StageColumn stage={stage} />
          </Grid>
        ))}
      </Grid>

      {/* Create Opportunity Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Opportunity</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Opportunity Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Account</InputLabel>
                <Select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  label="Account"
                >
                  {accounts.map(account => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Contact</InputLabel>
                <Select
                  value={formData.contactId}
                  onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                  label="Contact"
                >
                  {contacts.map(contact => (
                    <MenuItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Probability (%)"
                type="number"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Stage</InputLabel>
                <Select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as Opportunity['stage'] })}
                  label="Stage"
                >
                  <MenuItem value="prospecting">Prospecting</MenuItem>
                  <MenuItem value="qualification">Qualification</MenuItem>
                  <MenuItem value="proposal">Proposal</MenuItem>
                  <MenuItem value="negotiation">Negotiation</MenuItem>
                  <MenuItem value="closed-won">Closed Won</MenuItem>
                  <MenuItem value="closed-lost">Closed Lost</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expected Close Date"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateOpportunity} variant="contained">Create Opportunity</Button>
        </DialogActions>
      </Dialog>

      {/* Opportunity Actions Menu */}
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
          Call Contact
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Email sx={{ mr: 1 }} />
          Email Contact
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Business sx={{ mr: 1 }} />
          View Account
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
