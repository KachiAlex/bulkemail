import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  TextField,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Phone,
  Email,
  Business,
  LocationOn,
  TrendingUp,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { contactsAPI, aiAPI } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ContactDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [calculatingScore, setCalculatingScore] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchContact();
      fetchRecommendations();
    }
  }, [id]);

  const fetchContact = async () => {
    try {
      const response = await contactsAPI.getOne(id!);
      setContact(response);
    } catch (error) {
      toast.error('Failed to load contact');
      navigate('/contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await aiAPI.getFollowUpRecommendations(id!);
      setRecommendations(response);
    } catch (error) {
      console.error('Failed to load AI recommendations');
    }
  };

  const handleCalculateScore = async () => {
    setCalculatingScore(true);
    try {
      const response = await aiAPI.calculateLeadScore(id!);
      setContact({ ...contact, leadScore: (response as any).score });
      toast.success(`Lead score updated: ${(response as any).score}`);
    } catch (error) {
      toast.error('Failed to calculate lead score');
    } finally {
      setCalculatingScore(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsAPI.delete(id!);
        toast.success('Contact deleted successfully');
        navigate('/contacts');
      } catch (error) {
        toast.error('Failed to delete contact');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!contact) {
    return null;
  }

  const statusColors: Record<string, any> = {
    new: 'default',
    contacted: 'primary',
    qualified: 'success',
    negotiating: 'warning',
    converted: 'success',
    lost: 'error',
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/contacts')}
          sx={{ mb: 2 }}
        >
          Back to Contacts
        </Button>

        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
              {contact.firstName[0]}{contact.lastName[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {contact.firstName} {contact.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {contact.jobTitle} {contact.company && `at ${contact.company}`}
              </Typography>
              <Box mt={1} display="flex" gap={1}>
                <Chip
                  label={contact.status}
                  color={statusColors[contact.status]}
                  size="small"
                />
                {contact.tags?.map((tag: string) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<Phone />}>
              Call
            </Button>
            <Button variant="outlined" startIcon={<Email />}>
              Email
            </Button>
            <IconButton onClick={() => navigate(`/contacts/${id}/edit`)}>
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={handleDelete}>
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="Overview" />
              <Tab label="Activity" />
              <Tab label="Notes" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Contact Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Email sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body2">{contact.email}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Phone
                          </Typography>
                          <Typography variant="body2">{contact.phone || 'N/A'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Business sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Company
                          </Typography>
                          <Typography variant="body2">{contact.company || 'N/A'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <LocationOn sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Location
                          </Typography>
                          <Typography variant="body2">
                            {[contact.city, contact.state, contact.country]
                              .filter(Boolean)
                              .join(', ') || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Additional Details */}
                {contact.website && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Website
                    </Typography>
                    <Typography variant="body2">
                      <a href={contact.website} target="_blank" rel="noopener noreferrer">
                        {contact.website}
                      </a>
                    </Typography>
                  </Grid>
                )}

                {contact.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2">{contact.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="body2" color="text.secondary">
                No activity recorded yet
              </Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Add notes about this contact..."
                defaultValue={contact.notes}
              />
              <Box mt={2}>
                <Button variant="contained">Save Notes</Button>
              </Box>
            </TabPanel>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Lead Score */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Lead Score</Typography>
                <TrendingUp color="primary" />
              </Box>
              <Box textAlign="center" mb={2}>
                <Typography variant="h2" fontWeight="bold" color="primary.main">
                  {contact.leadScore || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  out of 100
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleCalculateScore}
                disabled={calculatingScore}
              >
                {calculatingScore ? 'Calculating...' : 'Recalculate Score'}
              </Button>
            </CardContent>
          </Card>

          {/* Engagement Stats */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Engagement
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4">{contact.emailsOpened || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Emails Opened
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4">{contact.linksClicked || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Links Clicked
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4">{contact.callsReceived || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Calls Made
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4">{contact.emailsSent || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Emails Sent
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          {recommendations && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Recommendations
                </Typography>
                <Chip
                  label={`Priority: ${recommendations.priority}`}
                  size="small"
                  color={
                    recommendations.priority === 'high'
                      ? 'error'
                      : recommendations.priority === 'medium'
                      ? 'warning'
                      : 'default'
                  }
                  sx={{ mb: 2 }}
                />
                <List dense>
                  {recommendations.recommendations?.map((rec: string, index: number) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={rec}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
                {recommendations.bestContactTime && (
                  <Typography variant="caption" color="text.secondary">
                    Best time to contact: {recommendations.bestContactTime}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
