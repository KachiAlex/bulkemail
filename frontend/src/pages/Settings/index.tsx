import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  TextField,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Save,
  Refresh,
  Edit,
  Email,
  Phone,
  Business,
  Notifications,
  Download,
  Upload,
  Settings as SettingsIcon,
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getCurrencySymbol, getCurrencyName } from '../../utils/currency';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  avatar?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  dealUpdates: boolean;
  taskReminders: boolean;
  systemAlerts: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginNotifications: boolean;
  apiAccess: boolean;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corp',
    role: 'Administrator',
    avatar: ''
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    dealUpdates: true,
    taskReminders: true,
    systemAlerts: true
  });
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD' // Will be set in useEffect
  });
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true,
    apiAccess: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);

  // Initialize currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('crm-currency');
    if (savedCurrency) {
      setAppearance(prev => ({ ...prev, currency: savedCurrency }));
    }
  }, []);

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification settings saved');
  };

  const handleSaveAppearance = () => {
    // Save currency preference to localStorage
    localStorage.setItem('crm-currency', appearance.currency);
    toast.success('Appearance settings saved');
  };

  const handleSaveSecurity = () => {
    toast.success('Security settings saved');
  };

  const renderProfileTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              />
            </Grid>
          </Grid>
          <Box mt={3} display="flex" gap={2}>
            <Button variant="contained" startIcon={<Save />} onClick={handleSaveProfile}>
              Save Changes
            </Button>
            <Button variant="outlined" startIcon={<Edit />}>
              Edit Avatar
            </Button>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Avatar
          </Typography>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ width: 80, height: 80 }}>
              <AccountCircle sx={{ fontSize: 60 }} />
            </Avatar>
            <Box>
              <Button variant="outlined" startIcon={<Upload />}>
                Upload Photo
              </Button>
              <Typography variant="caption" display="block" mt={1}>
                JPG, PNG or GIF. Max size 2MB.
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );

  const renderNotificationsTab = () => (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Notification Preferences
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <Email />
          </ListItemIcon>
          <ListItemText
            primary="Email Notifications"
            secondary="Receive notifications via email"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={notifications.emailNotifications}
              onChange={(e) => setNotifications({
                ...notifications,
                emailNotifications: e.target.checked
              })}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Phone />
          </ListItemIcon>
          <ListItemText
            primary="SMS Notifications"
            secondary="Receive notifications via SMS"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={notifications.smsNotifications}
              onChange={(e) => setNotifications({
                ...notifications,
                smsNotifications: e.target.checked
              })}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Notifications />
          </ListItemIcon>
          <ListItemText
            primary="Push Notifications"
            secondary="Receive push notifications in browser"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={notifications.pushNotifications}
              onChange={(e) => setNotifications({
                ...notifications,
                pushNotifications: e.target.checked
              })}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Business />
          </ListItemIcon>
          <ListItemText
            primary="Weekly Reports"
            secondary="Receive weekly performance reports"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={notifications.weeklyReports}
              onChange={(e) => setNotifications({
                ...notifications,
                weeklyReports: e.target.checked
              })}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primary="Deal Updates"
            secondary="Get notified about deal status changes"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={notifications.dealUpdates}
              onChange={(e) => setNotifications({
                ...notifications,
                dealUpdates: e.target.checked
              })}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primary="Task Reminders"
            secondary="Get reminded about upcoming tasks"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={notifications.taskReminders}
              onChange={(e) => setNotifications({
                ...notifications,
                taskReminders: e.target.checked
              })}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primary="System Alerts"
            secondary="Receive system maintenance and security alerts"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={notifications.systemAlerts}
              onChange={(e) => setNotifications({
                ...notifications,
                systemAlerts: e.target.checked
              })}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
      <Box mt={3}>
        <Button variant="contained" startIcon={<Save />} onClick={handleSaveNotifications}>
          Save Notification Settings
        </Button>
      </Box>
    </Card>
  );

  const renderAppearanceTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Theme & Display
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={appearance.theme}
                  onChange={(e) => setAppearance({ ...appearance, theme: e.target.value as any })}
                  label="Theme"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={appearance.language}
                  onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={appearance.timezone}
                  onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                  label="Timezone"
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="EST">Eastern Time</MenuItem>
                  <MenuItem value="PST">Pacific Time</MenuItem>
                  <MenuItem value="GMT">Greenwich Mean Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Format & Currency
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={appearance.dateFormat}
                  onChange={(e) => setAppearance({ ...appearance, dateFormat: e.target.value })}
                  label="Date Format"
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={appearance.currency}
                  onChange={(e) => setAppearance({ ...appearance, currency: e.target.value })}
                  label="Currency"
                >
                  {/* North America */}
                  <MenuItem disabled>
                    <Typography variant="subtitle2" color="primary">🌎 North America</Typography>
                  </MenuItem>
                  <MenuItem value="USD">🇺🇸 USD - US Dollar ($)</MenuItem>
                  <MenuItem value="CAD">🇨🇦 CAD - Canadian Dollar (C$)</MenuItem>
                  <MenuItem value="MXN">🇲🇽 MXN - Mexican Peso ($)</MenuItem>
                  
                  {/* Europe */}
                  <MenuItem disabled>
                    <Typography variant="subtitle2" color="primary">🌍 Europe</Typography>
                  </MenuItem>
                  <MenuItem value="EUR">🇪🇺 EUR - Euro (€)</MenuItem>
                  <MenuItem value="GBP">🇬🇧 GBP - British Pound (£)</MenuItem>
                  <MenuItem value="CHF">🇨🇭 CHF - Swiss Franc (CHF)</MenuItem>
                  <MenuItem value="SEK">🇸🇪 SEK - Swedish Krona (kr)</MenuItem>
                  <MenuItem value="NOK">🇳🇴 NOK - Norwegian Krone (kr)</MenuItem>
                  <MenuItem value="DKK">🇩🇰 DKK - Danish Krone (kr)</MenuItem>
                  
                  {/* Asia */}
                  <MenuItem disabled>
                    <Typography variant="subtitle2" color="primary">🌏 Asia</Typography>
                  </MenuItem>
                  <MenuItem value="JPY">🇯🇵 JPY - Japanese Yen (¥)</MenuItem>
                  <MenuItem value="CNY">🇨🇳 CNY - Chinese Yuan (¥)</MenuItem>
                  <MenuItem value="INR">🇮🇳 INR - Indian Rupee (₹)</MenuItem>
                  <MenuItem value="SGD">🇸🇬 SGD - Singapore Dollar (S$)</MenuItem>
                  <MenuItem value="HKD">🇭🇰 HKD - Hong Kong Dollar (HK$)</MenuItem>
                  <MenuItem value="KRW">🇰🇷 KRW - South Korean Won (₩)</MenuItem>
                  <MenuItem value="THB">🇹🇭 THB - Thai Baht (฿)</MenuItem>
                  
                  {/* Africa */}
                  <MenuItem disabled>
                    <Typography variant="subtitle2" color="primary">🌍 Africa</Typography>
                  </MenuItem>
                  <MenuItem value="NGN">🇳🇬 NGN - Nigerian Naira (₦)</MenuItem>
                  <MenuItem value="ZAR">🇿🇦 ZAR - South African Rand (R)</MenuItem>
                  <MenuItem value="EGP">🇪🇬 EGP - Egyptian Pound (E£)</MenuItem>
                  <MenuItem value="KES">🇰🇪 KES - Kenyan Shilling (KSh)</MenuItem>
                  <MenuItem value="GHS">🇬🇭 GHS - Ghanaian Cedi (₵)</MenuItem>
                  <MenuItem value="TZS">🇹🇿 TZS - Tanzanian Shilling (TSh)</MenuItem>
                  <MenuItem value="UGX">🇺🇬 UGX - Ugandan Shilling (USh)</MenuItem>
                  <MenuItem value="ETB">🇪🇹 ETB - Ethiopian Birr (Br)</MenuItem>
                  <MenuItem value="MAD">🇲🇦 MAD - Moroccan Dirham (MAD)</MenuItem>
                  <MenuItem value="TND">🇹🇳 TND - Tunisian Dinar (DT)</MenuItem>
                  <MenuItem value="DZD">🇩🇿 DZD - Algerian Dinar (DA)</MenuItem>
                  
                  {/* Oceania */}
                  <MenuItem disabled>
                    <Typography variant="subtitle2" color="primary">🌏 Oceania</Typography>
                  </MenuItem>
                  <MenuItem value="AUD">🇦🇺 AUD - Australian Dollar (A$)</MenuItem>
                  <MenuItem value="NZD">🇳🇿 NZD - New Zealand Dollar (NZ$)</MenuItem>
                  
                  {/* South America */}
                  <MenuItem disabled>
                    <Typography variant="subtitle2" color="primary">🌎 South America</Typography>
                  </MenuItem>
                  <MenuItem value="BRL">🇧🇷 BRL - Brazilian Real (R$)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Currency Preview:
                </Typography>
                <Typography variant="h6" color="primary">
                  {getCurrencySymbol(appearance.currency)}1,000.00 {appearance.currency}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getCurrencyName(appearance.currency)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" gap={2}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSaveAppearance}>
            Save Appearance Settings
          </Button>
          <Button variant="outlined" startIcon={<Refresh />}>
            Reset to Defaults
          </Button>
        </Box>
      </Grid>
    </Grid>
  );

  const renderSecurityTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Authentication
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Lock />
              </ListItemIcon>
              <ListItemText
                primary="Two-Factor Authentication"
                secondary="Add an extra layer of security to your account"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={security.twoFactorAuth}
                  onChange={(e) => setSecurity({
                    ...security,
                    twoFactorAuth: e.target.checked
                  })}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Login Notifications"
                secondary="Get notified when someone logs into your account"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={security.loginNotifications}
                  onChange={(e) => setSecurity({
                    ...security,
                    loginNotifications: e.target.checked
                  })}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="API Access"
                secondary="Allow third-party applications to access your data"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={security.apiAccess}
                  onChange={(e) => setSecurity({
                    ...security,
                    apiAccess: e.target.checked
                  })}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Password & Security
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setChangePasswordDialog(true)}
            >
              Change Password
            </Button>
            <FormControl fullWidth>
              <InputLabel>Session Timeout</InputLabel>
              <Select
                value={security.sessionTimeout}
                onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value as number })}
                label="Session Timeout"
              >
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Password Expiry</InputLabel>
              <Select
                value={security.passwordExpiry}
                onChange={(e) => setSecurity({ ...security, passwordExpiry: e.target.value as number })}
                label="Password Expiry"
              >
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={60}>60 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
                <MenuItem value={180}>180 days</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" gap={2}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSaveSecurity}>
            Save Security Settings
          </Button>
          <Button variant="outlined" startIcon={<Download />}>
            Export Security Log
          </Button>
        </Box>
      </Grid>
    </Grid>
  );

  const renderChangePasswordDialog = () => (
    <Dialog
      open={changePasswordDialog}
      onClose={() => setChangePasswordDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          <TextField
            fullWidth
            label="Current Password"
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
          />
          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? 'text' : 'password'}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setChangePasswordDialog(false)}>
          Cancel
        </Button>
        <Button variant="contained">
          Change Password
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
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account preferences and system settings
          </Typography>
        </Box>
      </Box>

      {/* Settings Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Profile" />
          <Tab label="Notifications" />
          <Tab label="Appearance" />
          <Tab label="Security" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && renderProfileTab()}
      {activeTab === 1 && renderNotificationsTab()}
      {activeTab === 2 && renderAppearanceTab()}
      {activeTab === 3 && renderSecurityTab()}

      {/* Change Password Dialog */}
      {renderChangePasswordDialog()}
    </Box>
  );
}