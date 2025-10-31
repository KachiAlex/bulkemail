import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Email,
  Phone,
  Sms,
  Assignment,
  AttachMoney,
  Schedule,
  Download,
  Refresh,
  Person,
  Assessment,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface AnalyticsData {
  overview: {
    totalContacts: number;
    totalOpportunities: number;
    totalRevenue: number;
    conversionRate: number;
    growthRate: number;
  };
  contacts: {
    newThisMonth: number;
    totalActive: number;
    bySource: Array<{ source: string; count: number; percentage: number }>;
    byStatus: Array<{ status: string; count: number; percentage: number }>;
  };
  opportunities: {
    totalValue: number;
    wonValue: number;
    lostValue: number;
    byStage: Array<{ stage: string; count: number; value: number }>;
    conversionRate: number;
  };
  activities: {
    totalCalls: number;
    totalEmails: number;
    totalSMS: number;
    totalTasks: number;
    byType: Array<{ type: string; count: number; percentage: number }>;
  };
  revenue: {
    currentMonth: number;
    lastMonth: number;
    growth: number;
    bySource: Array<{ source: string; amount: number; percentage: number }>;
    trend: Array<{ month: string; revenue: number }>;
  };
  performance: {
    topContacts: Array<{ name: string; value: number; activities: number }>;
    topOpportunities: Array<{ name: string; value: number; stage: string }>;
    recentActivities: Array<{ type: string; description: string; timestamp: string }>;
  };
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      // For now, return mock data since analytics API doesn't exist
      const mockData: AnalyticsData = {
        overview: {
          totalContacts: 1247,
          totalOpportunities: 89,
          totalRevenue: 245000,
          conversionRate: 12.5,
          growthRate: 8.3
        },
        contacts: {
          newThisMonth: 156,
          totalActive: 892,
          bySource: [
            { source: 'Website', count: 456, percentage: 36.6 },
            { source: 'Referral', count: 234, percentage: 18.8 },
            { source: 'Social Media', count: 189, percentage: 15.2 },
            { source: 'Email Campaign', count: 156, percentage: 12.5 },
            { source: 'Other', count: 212, percentage: 17.0 }
          ],
          byStatus: [
            { status: 'Active', count: 892, percentage: 71.5 },
            { status: 'Lead', count: 234, percentage: 18.8 },
            { status: 'Customer', count: 89, percentage: 7.1 },
            { status: 'Inactive', count: 32, percentage: 2.6 }
          ]
        },
        opportunities: {
          totalValue: 1250000,
          wonValue: 245000,
          lostValue: 89000,
          byStage: [
            { stage: 'Prospecting', count: 23, value: 180000 },
            { stage: 'Qualification', count: 18, value: 220000 },
            { stage: 'Proposal', count: 15, value: 195000 },
            { stage: 'Negotiation', count: 12, value: 160000 },
            { stage: 'Closed Won', count: 8, value: 245000 },
            { stage: 'Closed Lost', count: 13, value: 89000 }
          ],
          conversionRate: 12.5
        },
        activities: {
          totalCalls: 456,
          totalEmails: 1234,
          totalSMS: 567,
          totalTasks: 234,
          byType: [
            { type: 'Email', count: 1234, percentage: 45.2 },
            { type: 'Call', count: 456, percentage: 16.7 },
            { type: 'SMS', count: 567, percentage: 20.8 },
            { type: 'Task', count: 234, percentage: 8.6 },
            { type: 'Meeting', count: 234, percentage: 8.6 }
          ]
        },
        revenue: {
          currentMonth: 245000,
          lastMonth: 189000,
          growth: 29.6,
          bySource: [
            { source: 'New Customers', amount: 145000, percentage: 59.2 },
            { source: 'Upsells', amount: 67000, percentage: 27.3 },
            { source: 'Renewals', amount: 33000, percentage: 13.5 }
          ],
          trend: [
            { month: 'Jan', revenue: 189000 },
            { month: 'Feb', revenue: 203000 },
            { month: 'Mar', revenue: 178000 },
            { month: 'Apr', revenue: 221000 },
            { month: 'May', revenue: 198000 },
            { month: 'Jun', revenue: 245000 }
          ]
        },
        performance: {
          topContacts: [
            { name: 'John Smith', value: 45000, activities: 23 },
            { name: 'Sarah Johnson', value: 38000, activities: 19 },
            { name: 'Mike Davis', value: 32000, activities: 15 },
            { name: 'Lisa Wilson', value: 28000, activities: 12 },
            { name: 'David Brown', value: 25000, activities: 18 }
          ],
          topOpportunities: [
            { name: 'Enterprise Software License', value: 125000, stage: 'Negotiation' },
            { name: 'Cloud Migration Project', value: 89000, stage: 'Proposal' },
            { name: 'Data Analytics Platform', value: 67000, stage: 'Qualification' },
            { name: 'Security Implementation', value: 45000, stage: 'Prospecting' },
            { name: 'Integration Services', value: 32000, stage: 'Closed Won' }
          ],
          recentActivities: [
            { type: 'Call', description: 'Follow-up call with John Smith', timestamp: '2 hours ago' },
            { type: 'Email', description: 'Sent proposal to Sarah Johnson', timestamp: '4 hours ago' },
            { type: 'Task', description: 'Completed demo for Mike Davis', timestamp: '6 hours ago' },
            { type: 'SMS', description: 'Sent reminder to Lisa Wilson', timestamp: '8 hours ago' },
            { type: 'Meeting', description: 'Scheduled meeting with David Brown', timestamp: '1 day ago' }
          ]
        }
      };
      
      setAnalyticsData(mockData);
      toast.info('Analytics data loaded (demo mode)');
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error(error.message || 'Failed to load analytics');
    } finally {
      // Loading completed
    }
  };

  const renderOverviewCards = () => {
    if (!analyticsData) return null;

    const { overview } = analyticsData;
    const cards = [
      {
        title: 'Total Contacts',
        value: (overview?.totalContacts ?? 0).toLocaleString(),
        change: `+${overview?.growthRate ?? 0}%`,
        trend: 'up',
        icon: <People />,
        color: 'primary'
      },
      {
        title: 'Active Opportunities',
        value: (overview?.totalOpportunities ?? 0).toLocaleString(),
        change: `${overview?.conversionRate ?? 0}% conversion`,
        trend: 'up',
        icon: <AttachMoney />,
        color: 'success'
      },
      {
        title: 'Total Revenue',
        value: `$${(overview?.totalRevenue ?? 0).toLocaleString()}`,
        change: `+${overview?.growthRate ?? 0}%`,
        trend: 'up',
        icon: <TrendingUp />,
        color: 'warning'
      },
      {
        title: 'Conversion Rate',
        value: `${overview?.conversionRate ?? 0}%`,
        change: 'vs last month',
        trend: 'up',
        icon: <Assessment />,
        color: 'info'
      }
    ];

    return (
      <Grid container spacing={3} mb={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: `${card.color}.main`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
                <Box flex={1}>
                  <Typography variant="h4" fontWeight="bold">
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    {card.trend === 'up' ? (
                      <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {card.change}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderContactsAnalytics = () => {
    if (!analyticsData) return null;

    const { contacts } = analyticsData;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contacts by Source
            </Typography>
            <List>
              {contacts.bySource.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={item.source}
                    secondary={`${item.count} contacts (${item.percentage}%)`}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={item.percentage}
                    sx={{ width: 100, height: 8, borderRadius: 4 }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contacts by Status
            </Typography>
            <List>
              {contacts.byStatus.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={item.status}
                    secondary={`${item.count} contacts (${item.percentage}%)`}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={item.percentage}
                    sx={{ width: 100, height: 8, borderRadius: 4 }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderOpportunitiesAnalytics = () => {
    if (!analyticsData) return null;

    const { opportunities } = analyticsData;
    if (!opportunities) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Opportunities by Stage
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Stage</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">Avg Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(opportunities?.byStage || []).map((stage, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip label={stage.stage} color="primary" size="small" />
                      </TableCell>
                      <TableCell align="right">{stage.count ?? 0}</TableCell>
                      <TableCell align="right">${(stage.value ?? 0).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        ${Math.round((stage.value ?? 0) / (stage.count || 1)).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Opportunity Metrics
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Pipeline Value
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  ${(opportunities?.totalValue ?? 0).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Won Value
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  ${(opportunities?.wonValue ?? 0).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Lost Value
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  ${(opportunities?.lostValue ?? 0).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Conversion Rate
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {opportunities.conversionRate}%
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderActivitiesAnalytics = () => {
    if (!analyticsData) return null;

    const { activities } = analyticsData;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Activity Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box textAlign="center" p={2} bgcolor="primary.light" borderRadius={2}>
                  <Phone sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {activities.totalCalls}
                  </Typography>
                  <Typography variant="body2">Calls</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={2}>
                  <Email sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {activities.totalEmails}
                  </Typography>
                  <Typography variant="body2">Emails</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" p={2} bgcolor="warning.light" borderRadius={2}>
                  <Sms sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {activities.totalSMS}
                  </Typography>
                  <Typography variant="body2">SMS</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" p={2} bgcolor="info.light" borderRadius={2}>
                  <Assignment sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {activities.totalTasks}
                  </Typography>
                  <Typography variant="body2">Tasks</Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Activities by Type
            </Typography>
            <List>
              {activities.byType.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={item.type}
                    secondary={`${item.count} activities (${item.percentage}%)`}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={item.percentage}
                    sx={{ width: 100, height: 8, borderRadius: 4 }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderRevenueAnalytics = () => {
    if (!analyticsData) return null;

    const { revenue } = analyticsData;
    if (!revenue) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Revenue Trend
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Typography variant="body1" color="text.secondary">
                Chart visualization would go here
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Revenue Breakdown
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current Month
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  ${(revenue?.currentMonth ?? 0).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Month
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  ${(revenue?.lastMonth ?? 0).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Growth
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  +{revenue?.growth ?? 0}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{ my: 2, borderBottom: 1, borderColor: 'divider' }} />
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Revenue by Source
            </Typography>
            {(revenue?.bySource || []).map((item, index) => (
              <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{item.source}</Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${(item.amount ?? 0).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderPerformanceAnalytics = () => {
    if (!analyticsData) return null;

    const { performance } = analyticsData;
    if (!performance) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top Contacts
            </Typography>
            <List>
              {(performance?.topContacts || []).map((contact, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={contact.name}
                    secondary={`$${(contact.value ?? 0).toLocaleString()} • ${contact.activities ?? 0} activities`}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top Opportunities
            </Typography>
            <List>
              {(performance?.topOpportunities || []).map((opportunity, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <AttachMoney />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={opportunity.name}
                    secondary={`$${(opportunity.value ?? 0).toLocaleString()} • ${opportunity.stage}`}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {performance.recentActivities.map((activity, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <Schedule />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.description}
                    secondary={activity.timestamp}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive insights into your CRM performance
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Date Range"
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAnalytics}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      {renderOverviewCards()}

      {/* Analytics Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Contacts" />
          <Tab label="Opportunities" />
          <Tab label="Activities" />
          <Tab label="Revenue" />
          <Tab label="Performance" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && renderContactsAnalytics()}
      {activeTab === 1 && renderOpportunitiesAnalytics()}
      {activeTab === 2 && renderActivitiesAnalytics()}
      {activeTab === 3 && renderRevenueAnalytics()}
      {activeTab === 4 && renderPerformanceAnalytics()}
    </Box>
  );
}