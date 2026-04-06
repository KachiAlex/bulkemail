import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  People,
  Phone,
  TrendingUp,
  Email,
  Business,
  Assignment,
  Add,
  Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { analyticsAPI } from '../../services/api';
import { crmAPI } from '../../services/crm-api';
import { Contact, Opportunity, Task, Activity } from '../../types/crm';
import { formatCurrency } from '../../utils/currency';
import { safeConvertToDate } from '../../utils/dateHelpers';

interface DashboardStats {
  contacts: {
    total: number;
    newThisMonth: number;
    avgLeadScore: number;
  };
  campaigns: {
    total: number;
    totalSent: number;
    openRate: number;
    clickThroughRate: number;
  };
  calls: {
    total: number;
    completed: number;
    avgDuration: number;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [crmStats, setCrmStats] = useState<any>(null);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [recentOpportunities, setRecentOpportunities] = useState<Opportunity[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const createSampleData = async () => {
    // Sample data creation disabled to prevent errors
    console.log('Sample data creation is disabled');
    return;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // First try to get analytics data (original functionality)
      let analyticsData = null;
      try {
        analyticsData = await analyticsAPI.getDashboard();
        setStats(analyticsData);
      } catch (error) {
        console.log('Analytics data not available, using defaults');
        setStats({
          contacts: { total: 0, newThisMonth: 0, avgLeadScore: 0 },
          campaigns: { total: 0, totalSent: 0, openRate: 0, clickThroughRate: 0 },
          calls: { total: 0, completed: 0, avgDuration: 0 }
        });
      }

      // Try to get CRM data, but don't fail if it's not available
      let contacts = [];
      try {
        const [crmData, contactsData, opportunities, tasks, activities] = await Promise.all([
          crmAPI.getDashboardStats(),
          crmAPI.getContacts(),
          crmAPI.getOpportunities(),
          crmAPI.getTasks(),
          crmAPI.getActivities()
        ]);
        
        contacts = contactsData;
        setCrmStats(crmData);
        setRecentContacts((contacts || []).slice(0, 5));
        setRecentOpportunities((opportunities || []).slice(0, 5));
        setRecentTasks((tasks || []).slice(0, 5));
        setRecentActivities((activities || []).slice(0, 10));
      } catch (error) {
        console.log('CRM data not available, using defaults');
        setCrmStats({
          contacts: { total: 0, new: 0, qualified: 0 },
          opportunities: { total: 0, open: 0, won: 0, totalValue: 0 },
          tasks: { total: 0, pending: 0, overdue: 0 },
          activities: { total: 0 }
        });
        setRecentContacts([]);
        setRecentOpportunities([]);
        setRecentTasks([]);
        setRecentActivities([]);
      }

      // If no data exists, show empty state
      if (contacts.length === 0) {
        console.log('No contacts found, showing empty state');
        // Don't create sample data - just show empty dashboard
      } else {
        console.log('Contacts already exist:', contacts.length);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }: any) => (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '16px',
        border: '1px solid rgba(106, 27, 154, 0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(106, 27, 154, 0.2)',
          border: '1px solid rgba(106, 27, 154, 0.3)',
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography 
              color="textSecondary" 
              gutterBottom 
              variant="h6"
              sx={{ 
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              component="h2"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography color="textSecondary" variant="body2" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" ml={0.5}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: color, 
              width: 64, 
              height: 64,
              boxShadow: '0 8px 16px rgba(106, 27, 154, 0.2)',
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f5ff 50%, #ffffff 100%)',
        p: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(106, 27, 154, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(156, 39, 176, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          CRM Dashboard
        </Typography>
        <Box>
          <IconButton 
            onClick={fetchDashboardData} 
            sx={{ 
              mr: 1,
              color: '#6a1b9a',
              '&:hover': {
                bgcolor: 'rgba(106, 27, 154, 0.1)',
              }
            }}
          >
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleMenuOpen}
            sx={{
              bgcolor: '#6a1b9a',
              '&:hover': {
                bgcolor: '#7b1fa2',
                transform: 'translateY(-2px)',
              },
              boxShadow: '0 4px 12px rgba(106, 27, 154, 0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            Quick Add
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/contacts'); }}>
              New Contact
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/campaigns/new'); }}>
              New Campaign
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/calls'); }}>
              New Task
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Contacts"
              value={crmStats?.contacts?.total || stats?.contacts?.total || 0}
              icon={<People />}
              color="primary.main"
              subtitle={`${crmStats?.contacts?.new || 0} new`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Open Opportunities"
              value={crmStats?.opportunities?.open || 0}
              icon={<Business />}
              color="success.main"
              subtitle={`${formatCurrency(crmStats?.opportunities?.totalValue || 0)} total value`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Tasks"
              value={crmStats?.tasks?.pending || 0}
              icon={<Assignment />}
              color="warning.main"
              subtitle={`${crmStats?.tasks?.overdue || 0} overdue`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Activities Today"
              value={crmStats?.activities?.total || 0}
              icon={<Email />}
              color="info.main"
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3}>
        {/* Recent Contacts */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '16px',
              border: '1px solid rgba(106, 27, 154, 0.1)',
              boxShadow: '0 4px 12px rgba(106, 27, 154, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(106, 27, 154, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#6a1b9a',
                  }}
                >
                  Recent Contacts
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/contacts')}
                  sx={{
                    color: '#9c27b0',
                    '&:hover': {
                      bgcolor: 'rgba(156, 39, 176, 0.1)',
                    },
                  }}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentContacts.map((contact, index) => (
                  <React.Fragment key={contact.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          {contact.firstName[0]}{contact.lastName[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${contact.firstName} ${contact.lastName}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {contact.email}
                            </Typography>
                            <Box display="flex" gap={1} mt={0.5}>
                              <Chip
                                label={contact.status}
                                size="small"
                                color={contact.status === 'qualified' ? 'success' : 'default'}
                              />
                              {contact.company && (
                                <Chip
                                  label={contact.company}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentContacts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Opportunities */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '16px',
              border: '1px solid rgba(106, 27, 154, 0.1)',
              boxShadow: '0 4px 12px rgba(106, 27, 154, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(106, 27, 154, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#6a1b9a',
                  }}
                >
                  Recent Opportunities
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/opportunities')}
                  sx={{
                    color: '#9c27b0',
                    '&:hover': {
                      bgcolor: 'rgba(156, 39, 176, 0.1)',
                    },
                  }}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentOpportunities.map((opportunity, index) => (
                  <React.Fragment key={opportunity.id}>
                    <ListItem>
                      <ListItemText
                        primary={opportunity.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {formatCurrency(opportunity.value)} • {opportunity.probability}% probability
                            </Typography>
                            <Box display="flex" gap={1} mt={0.5}>
                              <Chip
                                label={opportunity.stage}
                                size="small"
                                color={opportunity.stage === 'closed-won' ? 'success' : 'default'}
                              />
                              <Chip
                                label={opportunity.expectedCloseDate ? safeConvertToDate(opportunity.expectedCloseDate).toLocaleDateString() : 'No date'}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentOpportunities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '16px',
              border: '1px solid rgba(106, 27, 154, 0.1)',
              boxShadow: '0 4px 12px rgba(106, 27, 154, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(106, 27, 154, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#6a1b9a',
                  }}
                >
                  Recent Tasks
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/tasks')}
                  sx={{
                    color: '#9c27b0',
                    '&:hover': {
                      bgcolor: 'rgba(156, 39, 176, 0.1)',
                    },
                  }}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Due: {task.dueDate ? safeConvertToDate(task.dueDate).toLocaleDateString() : 'No due date'}
                            </Typography>
                            <Box display="flex" gap={1} mt={0.5}>
                              <Chip
                                label={task.priority}
                                size="small"
                                color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                              />
                              <Chip
                                label={task.status}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '16px',
              border: '1px solid rgba(106, 27, 154, 0.1)',
              boxShadow: '0 4px 12px rgba(106, 27, 154, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(106, 27, 154, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#6a1b9a',
                  }}
                >
                  Recent Activities
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/activities')}
                  sx={{
                    color: '#9c27b0',
                    '&:hover': {
                      bgcolor: 'rgba(156, 39, 176, 0.1)',
                    },
                  }}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentActivities.filter(activity => activity && activity.subject).map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          {activity.type === 'email' && <Email />}
                          {activity.type === 'call' && <Phone />}
                          {activity.type === 'task' && <Assignment />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.subject}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {activity.timestamp ? 
                                (() => {
                                  try {
                                    const date = safeConvertToDate(activity.timestamp);
                                    return date.toLocaleString();
                                  } catch {
                                    return 'Invalid date';
                                  }
                                })() : 'No timestamp'}
                            </Typography>
                            {activity.type && (
                              <Chip
                                label={activity.type}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
}

