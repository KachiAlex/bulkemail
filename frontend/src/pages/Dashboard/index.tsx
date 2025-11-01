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
    try {
      // Check if user already has data
      const existingContacts = await crmAPI.getContacts();
      if (existingContacts.length > 0) {
        console.log('User already has data, skipping sample data creation');
        return;
      }

      console.log('Creating sample data for new user...');
      
      // Create sample contacts
      const sampleContacts = [
        {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '+1 (555) 123-4567',
          company: 'Acme Corp',
          jobTitle: 'CEO',
          status: 'qualified' as const,
          leadScore: 85,
          tags: ['enterprise', 'decision-maker'],
          source: 'website',
          category: 'prospect' as const
        },
        {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@techstart.com',
          phone: '+1 (555) 234-5678',
          company: 'TechStart Inc',
          jobTitle: 'CTO',
          status: 'contacted' as const,
          leadScore: 72,
          tags: ['startup', 'tech'],
          source: 'referral',
          category: 'lead' as const
        },
        {
          firstName: 'Mike',
          lastName: 'Davis',
          email: 'mike.davis@globalcorp.com',
          phone: '+1 (555) 345-6789',
          company: 'Global Corp',
          jobTitle: 'VP Sales',
          status: 'new' as const,
          leadScore: 65,
          tags: ['enterprise', 'sales'],
          source: 'email-campaign',
          category: 'lead' as const
        }
      ];

      // Create sample opportunities
      const sampleOpportunities = [
        {
          name: 'Enterprise Software License',
          accountId: 'acme-corp-account', // Will be created as a placeholder
          contactId: '', // Will be set after contacts are created
          value: 125000,
          stage: 'negotiation' as const,
          probability: 75,
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          source: 'website',
          description: 'Enterprise software licensing deal with ACME Corp'
        },
        {
          name: 'Cloud Migration Project',
          accountId: 'techstart-account', // Will be created as a placeholder
          contactId: '', // Will be set after contacts are created
          value: 89000,
          stage: 'proposal' as const,
          probability: 60,
          expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          source: 'referral',
          description: 'Cloud migration project for TechStart Inc'
        }
      ];

      // Create sample tasks
      const sampleTasks = [
        {
          title: 'Follow up with John Smith',
          description: 'Call to discuss enterprise pricing',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          priority: 'high' as const,
          status: 'pending' as const,
          type: 'call' as const,
          assignedTo: 'current-user',
          createdBy: 'current-user'
        },
        {
          title: 'Prepare proposal for TechStart',
          description: 'Create detailed proposal for cloud migration',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          priority: 'medium' as const,
          status: 'pending' as const,
          type: 'follow-up' as const,
          assignedTo: 'current-user',
          createdBy: 'current-user'
        }
      ];

      // Create contacts first - start with just one to test
      const createdContacts = [];
      try {
        console.log('Creating first contact:', sampleContacts[0].firstName, sampleContacts[0].lastName);
        const created = await crmAPI.createContact(sampleContacts[0]);
        console.log('Contact created successfully:', created.id);
        createdContacts.push(created);
        console.log('First contact created, continuing with others...');
        
        // Create remaining contacts
        for (let i = 1; i < sampleContacts.length; i++) {
          try {
            console.log('Creating contact:', sampleContacts[i].firstName, sampleContacts[i].lastName);
            const created = await crmAPI.createContact(sampleContacts[i]);
            console.log('Contact created successfully:', created.id);
            createdContacts.push(created);
          } catch (error) {
            console.error('Error creating contact:', sampleContacts[i].firstName, error);
          }
        }
      } catch (error) {
        console.error('Error creating first contact:', error);
        console.error('Full error details:', error);
      }

      // Update opportunities with contact IDs
      for (let i = 0; i < sampleOpportunities.length; i++) {
        if (createdContacts[i]) {
          try {
            sampleOpportunities[i].contactId = createdContacts[i].id;
            console.log('Creating opportunity:', sampleOpportunities[i].name);
            console.log('Opportunity data:', JSON.stringify(sampleOpportunities[i], null, 2));
            const created = await crmAPI.createOpportunity(sampleOpportunities[i]);
            console.log('Opportunity created successfully:', created.id);
          } catch (error) {
            console.error('Error creating opportunity:', sampleOpportunities[i].name, error);
            console.error('Full error details:', error);
          }
        } else {
          console.log('No contact available for opportunity:', sampleOpportunities[i].name);
        }
      }

      // Create tasks
      for (const task of sampleTasks) {
        try {
          console.log('Creating task:', task.title);
          await crmAPI.createTask(task);
          console.log('Task created successfully');
        } catch (error) {
          console.error('Error creating task:', task.title, error);
        }
      }

      console.log('Sample data created successfully');
      toast.success('Welcome! Sample data has been added to get you started.');
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
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

      // If no data exists, create sample data
      if (contacts.length === 0) {
        console.log('No contacts found, creating sample data...');
        try {
          await createSampleData();
          console.log('Sample data creation completed');
          
          // Refresh data after creating sample data
          const [crmData, contactsData, opportunities, tasks, activities] = await Promise.all([
            crmAPI.getDashboardStats(),
            crmAPI.getContacts(),
            crmAPI.getOpportunities(),
            crmAPI.getTasks(),
            crmAPI.getActivities()
          ]);
          
          console.log('Refreshed data:', { contacts: contactsData.length, opportunities: opportunities.length, tasks: tasks.length });
          setCrmStats(crmData);
          setRecentContacts(contactsData.slice(0, 5));
          setRecentOpportunities(opportunities.slice(0, 5));
          setRecentTasks(tasks.slice(0, 5));
          setRecentActivities(activities.slice(0, 10));
        } catch (error) {
          console.error('Error creating sample data:', error);
          toast.error('Failed to create sample data');
        }
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
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
            {subtitle && (
              <Typography color="textSecondary" variant="body2">
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
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
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
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          CRM Dashboard
        </Typography>
        <Box>
          <IconButton onClick={fetchDashboardData} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleMenuOpen}
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

      <Grid container spacing={3}>
        {/* Recent Contacts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Contacts</Typography>
                <Button size="small" onClick={() => navigate('/contacts')}>View All</Button>
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
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Opportunities</Typography>
                <Button size="small" onClick={() => navigate('/opportunities')}>View All</Button>
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
                                label={opportunity.expectedCloseDate && !isNaN(new Date(opportunity.expectedCloseDate).getTime()) ? new Date(opportunity.expectedCloseDate).toLocaleDateString() : 'No date'}
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
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Tasks</Typography>
                <Button size="small" onClick={() => navigate('/tasks')}>View All</Button>
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
                              Due: {task.dueDate && !isNaN(new Date(task.dueDate).getTime()) ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
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
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Activities</Typography>
                <Button size="small" onClick={() => navigate('/activities')}>View All</Button>
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
                                    const date = new Date(activity.timestamp);
                                    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
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
  );
}

