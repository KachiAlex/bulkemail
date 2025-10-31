import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  TrendingUp,
  People,
  Business,
  Assignment,
  Phone,
  Email,
  Add,
  Refresh
} from '@mui/icons-material';
import { crmAPI } from '../../services/crm-api';
import { Contact, Opportunity, Task, Activity } from '../../types/crm';

interface DashboardStats {
  contacts: {
    total: number;
    new: number;
    qualified: number;
  };
  opportunities: {
    total: number;
    open: number;
    won: number;
    totalValue: number;
  };
  tasks: {
    total: number;
    pending: number;
    overdue: number;
  };
  activities: {
    total: number;
  };
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [recentOpportunities, setRecentOpportunities] = useState<Opportunity[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, contacts, opportunities, tasks, activities] = await Promise.all([
        crmAPI.getDashboardStats(),
        crmAPI.getContacts(),
        crmAPI.getOpportunities(),
        crmAPI.getTasks(),
        crmAPI.getActivities()
      ]);

      setStats(statsData || {});
      setRecentContacts((contacts || []).slice(0, 5));
      setRecentOpportunities((opportunities || []).slice(0, 5));
      setRecentTasks((tasks || []).slice(0, 5));
      setRecentActivities((activities || []).slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default empty data on error
      setStats({
        contacts: { total: 0, new: 0, qualified: 0 },
        opportunities: { total: 0, open: 0, won: 0, totalValue: 0 },
        tasks: { total: 0, pending: 0, overdue: 0 },
        activities: { total: 0 }
      });
      setRecentContacts([]);
      setRecentOpportunities([]);
      setRecentTasks([]);
      setRecentActivities([]);
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
        <LinearProgress />
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
            <MenuItem onClick={handleMenuClose}>New Contact</MenuItem>
            <MenuItem onClick={handleMenuClose}>New Opportunity</MenuItem>
            <MenuItem onClick={handleMenuClose}>New Task</MenuItem>
            <MenuItem onClick={handleMenuClose}>New Campaign</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Contacts"
            value={stats?.contacts.total || 0}
            icon={<People />}
            color="primary.main"
            subtitle={`${stats?.contacts.new || 0} new`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Opportunities"
            value={stats?.opportunities.open || 0}
            icon={<Business />}
            color="success.main"
            subtitle={`$${(stats?.opportunities?.totalValue || 0).toLocaleString()} total value`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Tasks"
            value={stats?.tasks.pending || 0}
            icon={<Assignment />}
            color="warning.main"
            subtitle={`${stats?.tasks.overdue || 0} overdue`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Activities Today"
            value={stats?.activities.total || 0}
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
                <Button size="small">View All</Button>
              </Box>
              <List>
                {recentContacts.map((contact, index) => (
                  <React.Fragment key={contact.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          {(contact.firstName || '')[0]}{(contact.lastName || '')[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${contact.firstName || ''} ${contact.lastName || ''}`}
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
                <Button size="small">View All</Button>
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
                              ${(opportunity?.value || 0).toLocaleString()} • {opportunity?.probability || 0}% probability
                            </Typography>
                            <Box display="flex" gap={1} mt={0.5}>
                              <Chip
                                label={opportunity.stage}
                                size="small"
                                color={opportunity.stage === 'closed-won' ? 'success' : 'default'}
                              />
                              <Chip
                                label={opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString() : 'No date'}
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
                <Button size="small">View All</Button>
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
                              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
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
                <Button size="small">View All</Button>
              </Box>
              <List>
                {recentActivities.map((activity, index) => (
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
                            <Chip
                              label={activity.type}
                              size="small"
                              variant="outlined"
                            />
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
