import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Search,
  Settings,
  Logout,
  Person,
  TrendingUp,
  Phone,
  Email,
  Chat
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CRMNavigation from '../components/CRMNavigation';

interface CRMLayoutProps {
  children: React.ReactNode;
}

export default function CRMLayout({ children }: CRMLayoutProps) {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Implement logout logic
    navigate('/login');
  };

  const quickActions = [
    { label: 'New Contact', icon: <Person />, action: () => navigate('/crm/contacts') },
    { label: 'New Opportunity', icon: <TrendingUp />, action: () => navigate('/crm/opportunities') },
    { label: 'Send Email', icon: <Email />, action: () => navigate('/crm/email') },
    { label: 'Make Call', icon: <Phone />, action: () => navigate('/crm/calls') },
    { label: 'Start Chat', icon: <Chat />, action: () => navigate('/crm/chat') }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigation Drawer */}
      <CRMNavigation 
        open={navigationOpen} 
        onClose={() => setNavigationOpen(false)} 
      />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top App Bar */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setNavigationOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              CRM Dashboard
            </Typography>

            {/* Quick Actions */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
              {quickActions.slice(0, 3).map((action, index) => (
                <Button
                  key={index}
                  startIcon={action.icon}
                  onClick={action.action}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>

            {/* Search */}
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Search />
            </IconButton>

            {/* Notifications */}
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* Profile Menu */}
            <IconButton
              size="large"
              edge="end"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <Person />
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <Person sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
                <Settings sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Status Bar */}
        <Box sx={{ bgcolor: 'grey.50', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={2}>
              <Chip label="All Systems Operational" color="success" size="small" />
              <Chip label="Last Sync: 2 min ago" color="info" size="small" />
            </Box>
            <Box display="flex" gap={1}>
              <Chip label="CRM Pro" color="primary" size="small" />
              <Chip label="All Features" color="success" size="small" />
            </Box>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, bgcolor: 'grey.50' }}>
          {children}
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: 'grey.100', px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              © 2024 CRM Pro. All rights reserved.
            </Typography>
            <Box display="flex" gap={2}>
              <Typography variant="caption" color="text.secondary">
                Version 2.0.0
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
