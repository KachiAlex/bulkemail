import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard,
  People,
  Business,
  Assignment,
  Campaign,
  Analytics,
  Settings,
  Phone,
  Email,
  Chat,
  Security,
  Code,
  Extension as Integration,
  PhoneAndroid as Mobile
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/crm/dashboard'
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: <People />,
    path: '/crm/contacts',
    badge: 0
  },
  {
    id: 'accounts',
    label: 'Accounts',
    icon: <Business />,
    path: '/crm/accounts'
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    icon: <Assignment />,
    path: '/crm/opportunities'
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: <Campaign />,
    path: '/crm/campaigns'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <Analytics />,
    path: '/crm/analytics'
  }
];

const communicationItems: NavigationItem[] = [
  {
    id: 'email',
    label: 'Email',
    icon: <Email />,
    path: '/crm/email'
  },
  {
    id: 'sms',
    label: 'SMS',
    icon: <Phone />,
    path: '/crm/sms'
  },
  {
    id: 'calls',
    label: 'Calls',
    icon: <Phone />,
    path: '/crm/calls'
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: <Chat />,
    path: '/crm/chat'
  }
];

const automationItems: NavigationItem[] = [
  {
    id: 'workflows',
    label: 'Workflows',
    icon: <Settings />,
    path: '/crm/workflows'
  },
  {
    id: 'segments',
    label: 'Segments',
    icon: <People />,
    path: '/crm/segments'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: <Email />,
    path: '/crm/templates'
  }
];

const integrationItems: NavigationItem[] = [
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <Integration />,
    path: '/crm/integrations'
  },
  {
    id: 'api',
    label: 'API & Webhooks',
    icon: <Code />,
    path: '/crm/api'
  }
];

const enterpriseItems: NavigationItem[] = [
  {
    id: 'security',
    label: 'Security',
    icon: <Security />,
    path: '/crm/security'
  },
  {
    id: 'mobile',
    label: 'Mobile App',
    icon: <Mobile />,
    path: '/crm/mobile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings />,
    path: '/crm/settings'
  }
];

interface CRMNavigationProps {
  open: boolean;
  onClose: () => void;
}

export default function CRMNavigation({ open, onClose }: CRMNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavigationSection = ({ title, items }: { title: string; items: NavigationItem[] }) => (
    <Box>
      <Typography variant="overline" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
        {title}
      </Typography>
      <List>
        {items.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'inherit' : 'text.secondary',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                secondary={item.badge ? `${item.badge} new` : undefined}
              />
              {item.badge && item.badge > 0 && (
                <Chip
                  label={item.badge}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <Business />
          </Avatar>
          <Box>
            <Typography variant="h6">CRM Pro</Typography>
            <Typography variant="body2" color="text.secondary">
              Complete CRM Solution
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <NavigationSection title="Core CRM" items={navigationItems} />
        <Divider sx={{ my: 1 }} />
        <NavigationSection title="Communication" items={communicationItems} />
        <Divider sx={{ my: 1 }} />
        <NavigationSection title="Automation" items={automationItems} />
        <Divider sx={{ my: 1 }} />
        <NavigationSection title="Integrations" items={integrationItems} />
        <Divider sx={{ my: 1 }} />
        <NavigationSection title="Enterprise" items={enterpriseItems} />
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          CRM Pro v2.0
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          All features included
        </Typography>
      </Box>
    </Drawer>
  );
}
