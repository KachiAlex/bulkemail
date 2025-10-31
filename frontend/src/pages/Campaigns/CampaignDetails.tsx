import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Typography,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Send,
  Delete,
  Pause,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { campaignsAPI } from '../../services/api';
import { format } from 'date-fns';

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const data: any = await campaignsAPI.getOne(id!);
      // Convert Firestore timestamps to Date objects
      const campaignData = {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        sentAt: data.sentAt?.toDate ? data.sentAt.toDate() : data.sentAt,
        scheduledAt: data.scheduledAt?.toDate ? data.scheduledAt.toDate() : data.scheduledAt,
      };
      setCampaign(campaignData);
      setEditFormData({
        name: campaignData.name,
        description: campaignData.description || '',
        subject: campaignData.subject || '',
      });
    } catch (error) {
      toast.error('Failed to load campaign');
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      await campaignsAPI.update(id!, editFormData);
      toast.success('Campaign updated successfully');
      setEditDialogOpen(false);
      fetchCampaign();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!window.confirm('Are you sure you want to send this campaign now?')) {
      return;
    }
    try {
      await campaignsAPI.send(id!);
      toast.success('Campaign started successfully');
      fetchCampaign();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send campaign');
    }
  };

  const handlePause = async () => {
    try {
      await campaignsAPI.pause(id!);
      toast.success('Campaign paused');
      fetchCampaign();
    } catch (error: any) {
      toast.error(error.message || 'Failed to pause campaign');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }
    try {
      await campaignsAPI.delete(id!);
      toast.success('Campaign deleted successfully');
      navigate('/campaigns');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete campaign');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!campaign) {
  return (
      <Box>
        <Alert severity="error">Campaign not found</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/campaigns')} sx={{ mt: 2 }}>
          Back to Campaigns
        </Button>
      </Box>
    );
  }

  const statusColors: Record<string, any> = {
    draft: 'default',
    scheduled: 'info',
    sending: 'warning',
    sent: 'success',
    paused: 'warning',
    cancelled: 'error',
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/campaigns')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {campaign.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Chip
                label={campaign.status}
                color={statusColors[campaign.status] || 'default'}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {campaign.type.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
          >
            Edit
          </Button>
          {campaign.status === 'draft' && (
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleSend}
            >
              Send Now
            </Button>
          )}
          {campaign.status === 'sending' && (
            <Button
              variant="outlined"
              startIcon={<Pause />}
              onClick={handlePause}
              color="warning"
            >
              Pause
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Details
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            {campaign.description && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">{campaign.description}</Typography>
              </Box>
            )}

            {campaign.type === 'email' && campaign.subject && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Subject
                </Typography>
                <Typography variant="body1">{campaign.subject}</Typography>
              </Box>
            )}

            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Content
              </Typography>
              <Box
                sx={{
                  bgcolor: 'grey.50',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  minHeight: 200,
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  dangerouslySetInnerHTML={{ __html: campaign.content || campaign.htmlContent || '' }}
                />
              </Box>
            </Box>
          </Card>

          {/* Recipients */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recipients
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {campaign.totalRecipients || campaign.recipientContactIds?.length || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sent
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {campaign.sentCount || 0}
                </Typography>
              </Grid>
              {campaign.type === 'email' && (
                <>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Opened
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {campaign.openedCount || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Clicked
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {campaign.clickedCount || 0}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Info
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {campaign.createdAt && !isNaN(new Date(campaign.createdAt).getTime())
                  ? format(new Date(campaign.createdAt), 'MMM d, yyyy h:mm a')
                  : 'Not available'}
              </Typography>
            </Box>

            {campaign.scheduledAt && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Scheduled For
                </Typography>
                <Typography variant="body1">
                  {!isNaN(new Date(campaign.scheduledAt).getTime())
                    ? format(new Date(campaign.scheduledAt), 'MMM d, yyyy h:mm a')
                    : 'Invalid date'}
                </Typography>
              </Box>
            )}

            {campaign.sentAt && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sent At
                </Typography>
                <Typography variant="body1">
                  {!isNaN(new Date(campaign.sentAt).getTime())
                    ? format(new Date(campaign.sentAt), 'MMM d, yyyy h:mm a')
                    : 'Invalid date'}
                </Typography>
              </Box>
            )}

            {campaign.senderName && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sender Name
                </Typography>
                <Typography variant="body1">{campaign.senderName}</Typography>
              </Box>
            )}

            {campaign.senderEmail && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Sender Email
                </Typography>
                <Typography variant="body1">{campaign.senderEmail}</Typography>
              </Box>
            )}
          </Card>

          {/* Performance Metrics */}
          {campaign.type === 'email' && campaign.sentCount > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Open Rate
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {((campaign.openedCount / campaign.sentCount) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Click Rate
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {((campaign.clickedCount / campaign.sentCount) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Campaign</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </Grid>
            {campaign.type === 'email' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={editFormData.subject || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={saving || !editFormData.name}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
