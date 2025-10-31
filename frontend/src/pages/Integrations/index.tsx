import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Add,
  Settings,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Delete,
  Visibility,
  Business,
  Email,
  Phone,
  Api,
  Storage,
  Analytics,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: string;
  lastSync?: string;
  config?: any;
  features: string[];
}

interface IntegrationCategory {
  name: string;
  description: string;
  icon: any;
  integrations: Integration[];
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<IntegrationCategory[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      // Mock data for integrations
      const mockData: IntegrationCategory[] = [
        {
          name: 'Email & Communication',
          description: 'Connect your email and messaging platforms',
          icon: <Email />,
          integrations: [
            {
              id: 'gmail',
              name: 'Gmail',
              description: 'Sync emails and contacts with Gmail',
              category: 'email',
              status: 'connected',
              icon: 'Gmail',
              lastSync: '2 minutes ago',
              features: ['Email sync', 'Contact import', 'Calendar integration']
            },
            {
              id: 'outlook',
              name: 'Microsoft Outlook',
              description: 'Connect with Outlook for email and calendar',
              category: 'email',
              status: 'disconnected',
              icon: 'Outlook',
              features: ['Email sync', 'Calendar sync', 'Contact sync']
            },
            {
              id: 'slack',
              name: 'Slack',
              description: 'Team communication and notifications',
              category: 'communication',
              status: 'connected',
              icon: 'Slack',
              lastSync: '5 minutes ago',
              features: ['Team chat', 'Notifications', 'File sharing']
            }
          ]
        },
        {
          name: 'CRM & Sales',
          description: 'Integrate with other CRM and sales tools',
          icon: <Business />,
          integrations: [
            {
              id: 'salesforce',
              name: 'Salesforce',
              description: 'Sync data with Salesforce CRM',
              category: 'crm',
              status: 'error',
              icon: 'Salesforce',
              features: ['Contact sync', 'Opportunity sync', 'Custom fields']
            },
            {
              id: 'hubspot',
              name: 'HubSpot',
              description: 'Two-way sync with HubSpot CRM',
              category: 'crm',
              status: 'disconnected',
              icon: 'HubSpot',
              features: ['Contact sync', 'Deal sync', 'Marketing automation']
            },
            {
              id: 'pipedrive',
              name: 'Pipedrive',
              description: 'Connect with Pipedrive sales pipeline',
              category: 'crm',
              status: 'pending',
              icon: 'Pipedrive',
              features: ['Deal sync', 'Activity sync', 'Custom fields']
            }
          ]
        },
        {
          name: 'Communication',
          description: 'Phone, SMS, and video communication tools',
          icon: <Phone />,
          integrations: [
            {
              id: 'twilio',
              name: 'Twilio',
              description: 'SMS and voice communication platform',
              category: 'communication',
              status: 'connected',
              icon: 'Twilio',
              lastSync: '1 minute ago',
              features: ['SMS sending', 'Voice calls', 'Phone numbers']
            },
            {
              id: 'zoom',
              name: 'Zoom',
              description: 'Video conferencing and meetings',
              category: 'communication',
              status: 'connected',
              icon: 'Zoom',
              lastSync: '10 minutes ago',
              features: ['Video calls', 'Meeting scheduling', 'Recording']
            },
            {
              id: 'whatsapp',
              name: 'WhatsApp Business',
              description: 'WhatsApp Business API integration',
              category: 'communication',
              status: 'disconnected',
              icon: 'WhatsApp',
              features: ['WhatsApp messaging', 'Media sharing', 'Templates']
            }
          ]
        },
        {
          name: 'Analytics & Reporting',
          description: 'Data analytics and reporting tools',
          icon: <Analytics />,
          integrations: [
            {
              id: 'google-analytics',
              name: 'Google Analytics',
              description: 'Website and campaign analytics',
              category: 'analytics',
              status: 'connected',
              icon: 'Google Analytics',
              lastSync: '30 minutes ago',
              features: ['Website analytics', 'Campaign tracking', 'Custom reports']
            },
            {
              id: 'mixpanel',
              name: 'Mixpanel',
              description: 'User behavior and event tracking',
              category: 'analytics',
              status: 'disconnected',
              icon: 'Mixpanel',
              features: ['Event tracking', 'Funnel analysis', 'Cohort analysis']
            }
          ]
        },
        {
          name: 'Storage & Files',
          description: 'Cloud storage and file management',
          icon: <Storage />,
          integrations: [
            {
              id: 'google-drive',
              name: 'Google Drive',
              description: 'Cloud storage and file sharing',
              category: 'storage',
              status: 'connected',
              icon: 'Google Drive',
              lastSync: '1 hour ago',
              features: ['File storage', 'Document sharing', 'Collaboration']
            },
            {
              id: 'dropbox',
              name: 'Dropbox',
              description: 'File storage and synchronization',
              category: 'storage',
              status: 'disconnected',
              icon: 'Dropbox',
              features: ['File sync', 'Sharing', 'Version control']
            }
          ]
        }
      ];

      setIntegrations(mockData);
      toast.info('Integrations loaded (demo mode)');
    } catch (error: any) {
      console.error('Error fetching integrations:', error);
      toast.error(error.message || 'Failed to load integrations');
    } finally {
      // Loading completed
    }
  };

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigDialogOpen(true);
  };

  const handleDisconnect = (integration: Integration) => {
    toast.info(`Disconnecting ${integration.name}...`);
    // In a real app, this would make an API call
  };

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'error':
        return <Error sx={{ color: 'error.main' }} />;
      case 'pending':
        return <Warning sx={{ color: 'warning.main' }} />;
      default:
        return <Error sx={{ color: 'text.secondary' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'error':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderIntegrationCard = (integration: Integration) => (
    <Card key={integration.id} sx={{ p: 3, mb: 2 }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <Business />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h6" fontWeight="bold">
            {integration.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {integration.description}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          {getStatusIcon(integration.status)}
          <Chip
            label={integration.status}
            color={getStatusColor(integration.status) as any}
            size="small"
          />
        </Box>
      </Box>

      {integration.lastSync && (
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Last sync: {integration.lastSync}
        </Typography>
      )}

      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        {integration.features.map((feature, index) => (
          <Chip
            key={index}
            label={feature}
            size="small"
            variant="outlined"
          />
        ))}
      </Box>

      <Box display="flex" gap={1}>
        {integration.status === 'connected' ? (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Settings />}
              onClick={() => handleConfigure(integration)}
            >
              Configure
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Delete />}
              onClick={() => handleDisconnect(integration)}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => handleConnect(integration)}
          >
            Connect
          </Button>
        )}
        <Button
          variant="outlined"
          size="small"
          startIcon={<Visibility />}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );

  const renderCategorySection = (category: IntegrationCategory) => (
    <Box key={category.name} mb={4}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {category.icon}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {category.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {category.description}
          </Typography>
        </Box>
      </Box>
      <Grid container spacing={2}>
        {category.integrations.map((integration) => (
          <Grid item xs={12} md={6} key={integration.id}>
            {renderIntegrationCard(integration)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderConfigurationDialog = () => (
    <Dialog
      open={configDialogOpen}
      onClose={() => setConfigDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Configure {selectedIntegration?.name}
      </DialogTitle>
      <DialogContent>
        {selectedIntegration && (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {selectedIntegration.description}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API Secret"
                  type="password"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Webhook URL"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Sync Frequency</InputLabel>
                  <Select
                    value="realtime"
                    label="Sync Frequency"
                  >
                    <MenuItem value="realtime">Real-time</MenuItem>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Data Direction</InputLabel>
                  <Select
                    value="bidirectional"
                    label="Data Direction"
                  >
                    <MenuItem value="import">Import Only</MenuItem>
                    <MenuItem value="export">Export Only</MenuItem>
                    <MenuItem value="bidirectional">Bidirectional</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box mt={3}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Available Features
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {selectedIntegration.features.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfigDialogOpen(false)}>
          Cancel
        </Button>
        <Button variant="contained">
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Integrations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connect your favorite tools and services
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchIntegrations}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
          >
            Add Integration
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  8
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connected
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <Error />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  2
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Errors
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Warning />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  1
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Api />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  15
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Integration Categories */}
      {integrations.map((category) => renderCategorySection(category))}

      {/* Configuration Dialog */}
      {renderConfigurationDialog()}
    </Box>
  );
}
