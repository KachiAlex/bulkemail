import { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  Box,
  Button,
  Card,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  Typography,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Avatar,
  Divider,
  Grid,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText as MuiListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Badge,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Delete,
  Visibility,
  Send,
  Reply,
  Forward,
  Star,
  StarBorder,
  Archive,
  MarkAsUnread,
  AttachFile,
  Email as EmailIcon,
  Inbox,
  Drafts,
  ViewList,
  ViewModule,
  ExpandMore,
  Schedule,
  Edit,
  ContentCopy,
  Description as Template,
  Preview,
  Save,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { crmAPI } from '../../services/crm-api';
import { format } from 'date-fns';
import { auth, functions } from '../../../firebase-config';
import { httpsCallable } from 'firebase/functions';

// Email Template interface
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  isActive: boolean;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const emailStatusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  unread: 'error',
  read: 'default',
  replied: 'success',
  forwarded: 'primary',
  archived: 'warning',
};

const priorityColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  low: 'default',
  normal: 'primary',
  high: 'warning',
  urgent: 'error',
};

export default function Email() {
  const [emails, setEmails] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailDetailsOpen, setEmailDetailsOpen] = useState(false);
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeFolder, setActiveFolder] = useState('inbox');
  
  // Compose states
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Filtering states
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<[string, string]>(['', '']);
  const [senderFilter, setSenderFilter] = useState('');
  
  // View states
  const [viewMode, setViewMode] = useState<'list' | 'conversation'>('list');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // Template states
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general',
    isActive: true
  });
  const [templateEditorMode, setTemplateEditorMode] = useState<'code' | 'preview'>('code');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all');
  const [templatePage, setTemplatePage] = useState(0);
  const [templateRowsPerPage, setTemplateRowsPerPage] = useState(10);

  useEffect(() => {
    fetchEmails();
    fetchTemplates();
  }, [activeFolder]);

  const fetchEmails = async () => {
    try {
      const threads = await crmAPI.getEmailThreads();
      const userEmail = auth.currentUser?.email || '';
      // Flatten thread messages into individual emails for display
      const emails = threads.flatMap(thread => 
        (thread.messages || []).map((msg: any) => {
          // Convert Firestore timestamps to Date objects
          const timestamp = msg.timestamp || thread.lastMessageAt || new Date();
          const timestampDate = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
          // Determine folder: sent if from is current user, inbox if to is current user
          const isSent = msg.from?.toLowerCase() === userEmail.toLowerCase();
          return {
            id: msg.id,
            threadId: thread.id,
            from: msg.from,
            to: msg.to?.[0] || '',
            subject: msg.subject || thread.subject,
            body: msg.body || '',
            isHtml: msg.isHtml || false,
            timestamp: timestampDate,
            isRead: msg.isRead || false,
            isStarred: false,
            status: msg.isRead ? 'read' : 'unread',
            priority: 'normal',
            folder: isSent ? 'sent' : 'inbox',
            hasAttachments: msg.attachments && msg.attachments.length > 0,
            attachmentCount: msg.attachments?.length || 0,
            attachments: msg.attachments || [],
            messageId: msg.messageId || '',
            isReplied: msg.isReplied || false,
            isForwarded: msg.isForwarded || false
          };
        })
      );
      setEmails(emails);
    } catch (error: any) {
      console.error('Error fetching emails:', error);
      toast.error(error.message || 'Failed to load emails');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmails();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, email: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmail(email);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmail(null);
  };


  const handleDelete = async () => {
    if (!selectedEmail) return;

    try {
      toast.info('Delete functionality coming soon');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete email');
    }
    handleMenuClose();
  };

  const handleViewDetails = () => {
    setEmailDetailsOpen(true);
    handleMenuClose();
  };

  const handleReply = () => {
    if (selectedEmail) {
      setComposeDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleForward = () => {
    if (selectedEmail) {
      setComposeDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleSendEmail = async (content: string) => {
    if (!composeForm.to || !composeForm.subject || !content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      
      // For now, note attachments in the email body if present
      let finalContent = content;
      if (attachments.length > 0) {
        const attachmentList = attachments.map(f => `📎 ${f.name} (${(f.size / 1024).toFixed(2)} KB)`).join('<br>');
        finalContent = `${content}<br><br><hr><small><strong>Attachments (${attachments.length}):</strong><br>${attachmentList}</small>`;
      }
      
      // Use CRM API to send email (handles both sending and saving to Firestore)
      await crmAPI.sendEmail({
        to: composeForm.to,
        subject: composeForm.subject,
        html: finalContent
      });

      toast.success('Email sent successfully!');
      setComposeDialogOpen(false);
      setComposeForm({ to: '', subject: '', body: '' });
      setAttachments([]);
      
      // Refresh emails
      await fetchEmails();
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleAttachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleMarkAsRead = async (_emailId: string) => {
    try {
      toast.info('Mark as read functionality coming soon');
    } catch (error) {
      toast.error('Failed to update email');
    }
  };

  const handleToggleStar = async (_emailId: string) => {
    try {
      toast.info('Star functionality coming soon');
    } catch (error) {
      toast.error('Failed to update email');
    }
  };

  const handleArchive = async (_emailId: string) => {
    try {
      toast.info('Archive functionality coming soon');
    } catch (error) {
      toast.error('Failed to archive email');
    }
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setPriorityFilter([]);
    setDateRangeFilter(['', '']);
    setSenderFilter('');
    fetchEmails();
  };

  // Template functions
  const fetchTemplates = async () => {
    try {
      const getEmailTemplates = httpsCallable(functions, 'getEmailTemplates');
      const result: any = await getEmailTemplates();
      
      if (result.data.success) {
        // Convert Firestore timestamps to Date objects
        const processedTemplates = result.data.templates.map((t: any) => ({
          ...t,
          createdAt: t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt),
          updatedAt: t.updatedAt?.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt),
          variables: t.variables || []
        }));
        setTemplates(processedTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Don't show error toast on initial load - just use empty array
      setTemplates([]);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setTemplateForm({
      name: '',
      subject: '',
      body: '',
      category: 'general',
      isActive: true
    });
    setTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    console.log('Editing template:', template);
    setSelectedTemplate(template);
    const newForm = {
      name: template.name,
      subject: template.subject,
      body: template.body || '',
      category: template.category,
      isActive: template.isActive
    };
    console.log('Setting template form to:', newForm);
    setTemplateForm(newForm);
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.body.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (selectedTemplate) {
        // Update existing template
        const updateEmailTemplate = httpsCallable(functions, 'updateEmailTemplate');
        await updateEmailTemplate({
          id: selectedTemplate.id,
          name: templateForm.name,
          subject: templateForm.subject,
          body: templateForm.body,
          category: templateForm.category,
          isActive: templateForm.isActive
        });
        toast.success('Template updated successfully');
      } else {
        // Create new template
        const createEmailTemplate = httpsCallable(functions, 'createEmailTemplate');
        await createEmailTemplate({
          name: templateForm.name,
          subject: templateForm.subject,
          body: templateForm.body,
          category: templateForm.category,
          isActive: templateForm.isActive
        });
        toast.success('Template created successfully');
      }

      setTemplateDialogOpen(false);
      await fetchTemplates(); // Refresh the list
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(error.message || 'Failed to save template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const deleteEmailTemplate = httpsCallable(functions, 'deleteEmailTemplate');
      await deleteEmailTemplate({ id: templateId });
      toast.success('Template deleted successfully');
      await fetchTemplates(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handleUseTemplate = (_template: EmailTemplate) => {
    setComposeDialogOpen(true);
    // Set the compose form with template data
    // This would be handled in the compose dialog
    toast.info('Template loaded for composition');
  };

  const getFilteredTemplates = () => {
    let filtered = templates;

    if (templateSearchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.subject.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(templateSearchQuery.toLowerCase())
      );
    }

    if (templateCategoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === templateCategoryFilter);
    }

    return filtered;
  };

  const getEmailStats = () => {
    const stats = {
      total: emails.length,
      unread: emails.filter(e => e.status === 'unread').length,
      read: emails.filter(e => e.status === 'read').length,
      starred: emails.filter(e => e.isStarred).length,
      archived: emails.filter(e => e.isArchived).length,
      sent: emails.filter(e => e.folder === 'sent').length,
      drafts: emails.filter(e => e.folder === 'drafts').length,
    };
    return stats;
  };

  const getFilteredEmails = () => {
    let filtered = emails;

    if (searchQuery) {
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.body?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter(email => statusFilter.includes(email.status));
    }

    if (priorityFilter.length > 0) {
      filtered = filtered.filter(email => priorityFilter.includes(email.priority));
    }

    if (senderFilter) {
      filtered = filtered.filter(email => 
        email.from.toLowerCase().includes(senderFilter.toLowerCase())
      );
    }

    if (dateRangeFilter[0] && dateRangeFilter[1]) {
      filtered = filtered.filter(email => {
        const emailDate = new Date(email.timestamp);
        const startDate = new Date(dateRangeFilter[0]);
        const endDate = new Date(dateRangeFilter[1]);
        return emailDate >= startDate && emailDate <= endDate;
      });
    }

    return filtered;
  };

  const renderListView = () => {
    const filteredEmails = getFilteredEmails();

    return (
      <Card>
        <List>
          {filteredEmails.map((email) => (
            <ListItem 
              key={email.id} 
              divider
              sx={{ 
                bgcolor: email.status === 'unread' ? 'action.hover' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                <Checkbox
                  checked={selectedEmails.includes(email.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEmails([...selectedEmails, email.id]);
                    } else {
                      setSelectedEmails(selectedEmails.filter(id => id !== email.id));
                    }
                  }}
                />
              </ListItemIcon>
              <ListItemIcon>
                <IconButton onClick={() => handleToggleStar(email.id)}>
                  {email.isStarred ? (
                    <Star sx={{ color: 'warning.main' }} />
                  ) : (
                    <StarBorder />
                  )}
                </IconButton>
              </ListItemIcon>
              <MuiListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography 
                      variant="body1" 
                      fontWeight={email.status === 'unread' ? 'bold' : 'normal'}
                    >
                      {email.from}
                    </Typography>
                    {email.isStarred && (
                      <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                    )}
                    {email.priority !== 'normal' && (
                      <Chip
                        label={email.priority}
                        color={priorityColors[email.priority]}
                        size="small"
                      />
                    )}
                    <Chip
                      label={email.status}
                      color={emailStatusColors[email.status]}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {email.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {email.body?.substring(0, 100)}...
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="caption">
                          {format(new Date(email.timestamp), 'MMM d, h:mm a')}
                        </Typography>
                      </Box>
                      {email.hasAttachments && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AttachFile fontSize="small" color="action" />
                          <Typography variant="caption">
                            {email.attachmentCount} attachment(s)
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box display="flex" gap={1}>
                  <Tooltip title="Mark as Read">
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(email.id)}
                    >
                      <MarkAsUnread />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, email)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Card>
    );
  };

  const renderConversationView = () => {
    const filteredEmails = getFilteredEmails();
    const groupedEmails = filteredEmails.reduce((groups, email) => {
      const threadId = email.threadId || email.id;
      if (!groups[threadId]) {
        groups[threadId] = [];
      }
      groups[threadId].push(email);
      return groups;
    }, {} as Record<string, any[]>);

    return (
      <Box>
        {Object.entries(groupedEmails).map(([threadId, threadEmails]) => (
          <Accordion key={threadId} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" gap={2} width="100%">
                <Typography variant="h6" fontWeight="bold">
                  {(threadEmails as any[])[0].subject}
                </Typography>
                <Chip 
                  label={`${(threadEmails as any[]).length} messages`} 
                  size="small" 
                  color="primary"
                />
                <Box display="flex" gap={1} ml="auto">
                  <Chip
                    label={(threadEmails as any[])[0].from}
                    size="small"
                    color="secondary"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date((threadEmails as any[])[0].timestamp), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {(threadEmails as any[]).map((email: any, index: number) => (
                  <ListItem key={email.id} divider={index < (threadEmails as any[]).length - 1}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: email.type === 'sent' ? 'primary.main' : 'success.main' }}>
                        {email.type === 'sent' ? <Send /> : <EmailIcon />}
                      </Avatar>
                    </ListItemIcon>
                    <MuiListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {email.from}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(email.timestamp), 'h:mm a')}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {email.body}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <IconButton size="small" onClick={() => handleReply()}>
                          <Reply />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleForward()}>
                          <Forward />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  const renderTemplatesView = () => {
    const filteredTemplates = getFilteredTemplates();
    const paginatedTemplates = filteredTemplates.slice(
      templatePage * templateRowsPerPage,
      templatePage * templateRowsPerPage + templateRowsPerPage
    );

    return (
      <Box>
        {/* Template Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Email Templates
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateTemplate}
          >
            Create Template
          </Button>
        </Box>

        {/* Template Search and Filters */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              fullWidth
              size="small"
              placeholder="Search templates..."
              value={templateSearchQuery}
              onChange={(e) => setTemplateSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={templateCategoryFilter}
                onChange={(e) => setTemplateCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="welcome">Welcome</MenuItem>
                <MenuItem value="follow-up">Follow-up</MenuItem>
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="promotional">Promotional</MenuItem>
                <MenuItem value="support">Support</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Templates Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Variables</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTemplates.map((template) => (
                <TableRow key={template.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {template.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.body.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {template.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {template.variables.slice(0, 3).map((variable) => (
                        <Chip
                          key={variable}
                          label={`{{${variable}}}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {template.variables.length > 3 && (
                        <Chip
                          label={`+${template.variables.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={template.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {format(template.updatedAt, 'MMM d, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Use Template">
                        <IconButton
                          size="small"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Preview">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTemplatePreviewOpen(true);
                          }}
                        >
                          <Preview />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTemplate(template.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTemplates.length}
            rowsPerPage={templateRowsPerPage}
            page={templatePage}
            onPageChange={(_, newPage) => setTemplatePage(newPage)}
            onRowsPerPageChange={(e) => {
              setTemplateRowsPerPage(parseInt(e.target.value, 10));
              setTemplatePage(0);
            }}
          />
        </TableContainer>

        {filteredTemplates.length === 0 && (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No templates found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {templateSearchQuery || templateCategoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first email template'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateTemplate}
            >
              Create Template
            </Button>
          </Card>
        )}
      </Box>
    );
  };

  const stats = getEmailStats();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Email
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.total} emails • {stats.unread} unread • {stats.starred} starred
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('list')}
            startIcon={<ViewList />}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'conversation' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('conversation')}
            startIcon={<ViewModule />}
          >
            Conversation
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setComposeDialogOpen(true)}
          >
            Compose
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Inbox sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Emails
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MarkAsUnread sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.unread}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unread
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Star sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.starred}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Starred
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stats.sent}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sent
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Folder Navigation */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeFolder} onChange={(_, v) => setActiveFolder(v)}>
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Inbox />
                Inbox
                {stats.unread > 0 && (
                  <Badge badgeContent={stats.unread} color="error" />
                )}
              </Box>
            } 
            value="inbox" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Send />
                Sent
              </Box>
            } 
            value="sent" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Drafts />
                Drafts
              </Box>
            } 
            value="drafts" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Star />
                Starred
              </Box>
            } 
            value="starred" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Archive />
                Archived
              </Box>
            } 
            value="archived" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Template />
                Templates
                <Badge badgeContent={templates.length} color="primary" />
              </Box>
            } 
            value="templates" 
          />
        </Tabs>
      </Card>

      {/* Search and Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <form onSubmit={handleSearch} style={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </form>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filters
          </Button>
        </Box>

        {/* Advanced Filters */}
        {filtersOpen && (
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as string[])}
                    input={<OutlinedInput label="Status" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {['unread', 'read', 'replied', 'forwarded', 'archived'].map((status) => (
                      <MenuItem key={status} value={status}>
                        <Checkbox checked={statusFilter.indexOf(status) > -1} />
                        <MuiListItemText primary={status} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    multiple
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as string[])}
                    input={<OutlinedInput label="Priority" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {['low', 'normal', 'high', 'urgent'].map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        <Checkbox checked={priorityFilter.indexOf(priority) > -1} />
                        <MuiListItemText primary={priority} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="From"
                  value={senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Date"
                  type="date"
                  value={dateRangeFilter[0]}
                  onChange={(e) => setDateRangeFilter([e.target.value, dateRangeFilter[1]])}
                />
              </Grid>
            </Grid>
            <Box mt={2} display="flex" gap={1}>
              <Button size="small" onClick={fetchEmails}>
                Apply Filters
              </Button>
              <Button size="small" onClick={clearFilters}>
                Clear All
              </Button>
            </Box>
          </Box>
        )}
      </Card>

      {/* Main Content */}
      {activeFolder === 'templates' ? renderTemplatesView() : (viewMode === 'list' ? renderListView() : renderConversationView())}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleReply}>
          <Reply fontSize="small" sx={{ mr: 1 }} /> Reply
        </MenuItem>
        <MenuItem onClick={handleForward}>
          <Forward fontSize="small" sx={{ mr: 1 }} /> Forward
        </MenuItem>
        <MenuItem onClick={() => handleToggleStar(selectedEmail?.id)}>
          {selectedEmail?.isStarred ? (
            <>
              <Star fontSize="small" sx={{ mr: 1 }} /> Remove Star
            </>
          ) : (
            <>
              <StarBorder fontSize="small" sx={{ mr: 1 }} /> Add Star
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => handleArchive(selectedEmail?.id)}>
          <Archive fontSize="small" sx={{ mr: 1 }} /> Archive
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Email Details Dialog */}
      <Dialog 
        open={emailDetailsOpen} 
        onClose={() => setEmailDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          {selectedEmail && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedEmail.subject}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    From: {selectedEmail.from}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton onClick={() => handleToggleStar(selectedEmail.id)}>
                    {selectedEmail.isStarred ? (
                      <Star sx={{ color: 'warning.main' }} />
                    ) : (
                      <StarBorder />
                    )}
                  </IconButton>
                  <IconButton onClick={handleReply}>
                    <Reply />
                  </IconButton>
                  <IconButton onClick={handleForward}>
                    <Forward />
                  </IconButton>
                </Box>
              </Box>

              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                <Tab label="Message" />
                <Tab label="Attachments" />
                <Tab label="Headers" />
              </Tabs>

              {activeTab === 0 && (
                <Paper sx={{ p: 2 }}>
                  <Box mb={2}>
                    <Typography variant="h6" gutterBottom>
                      Message Content
                    </Typography>
                    <Divider />
                  </Box>
                  {selectedEmail.isHtml ? (
                    <Box 
                      sx={{ 
                        '& img': { maxWidth: '100%', height: 'auto' },
                        '& table': { maxWidth: '100%' },
                        '& pre': { whiteSpace: 'pre-wrap', wordBreak: 'break-word' }
                      }}
                      dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                    />
                  ) : (
                    <Typography variant="body1" whiteSpace="pre-wrap" sx={{ wordBreak: 'break-word' }}>
                    {selectedEmail.body}
                  </Typography>
                  )}
                </Paper>
              )}

              {activeTab === 1 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Attachments
                  </Typography>
                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 ? (
                    <Box>
                      {selectedEmail.attachments.map((attachment: any, index: number) => (
                        <Card key={index} sx={{ mb: 2, p: 2 }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <AttachFile />
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {attachment.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {attachment.size} • {attachment.type}
                              </Typography>
                            </Box>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Download">
                                <IconButton size="small">
                                  <AttachFile />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Preview">
                                <IconButton size="small">
                                  <Preview />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <AttachFile sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                        No attachments found for this email.
                  </Typography>
                    </Box>
                  )}
                </Paper>
              )}

              {activeTab === 2 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Email Headers
                  </Typography>
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box mb={2}>
                          <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                            From
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                            {selectedEmail.from || 'N/A'}
                  </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box mb={2}>
                          <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                            To
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedEmail.to || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box mb={2}>
                          <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                            Subject
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedEmail.subject || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box mb={2}>
                          <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                            Date
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedEmail.timestamp ? format(new Date(selectedEmail.timestamp), 'PPP p') : 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box mb={2}>
                          <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                            Message ID
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {selectedEmail.messageId || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box mb={2}>
                          <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                            Status
                          </Typography>
                          <Chip 
                            label={selectedEmail.status || 'Unknown'} 
                            size="small" 
                            color={emailStatusColors[selectedEmail.status] || 'default'}
                          />
                        </Box>
                      </Grid>
                      {selectedEmail.cc && (
                        <Grid item xs={12}>
                          <Box mb={2}>
                            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                              CC
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedEmail.cc}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {selectedEmail.bcc && (
                        <Grid item xs={12}>
                          <Box mb={2}>
                            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                              BCC
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedEmail.bcc}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {selectedEmail.replyTo && (
                        <Grid item xs={12}>
                          <Box mb={2}>
                            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                              Reply-To
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedEmail.replyTo}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Paper>
              )}
            </>
          )}
        </Box>
      </Dialog>

      {/* Compose Dialog */}
      <Dialog 
        open={composeDialogOpen} 
        onClose={() => {
          setComposeDialogOpen(false);
          setComposeForm({ to: '', subject: '', body: '' });
        }}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Compose Email
          </Typography>
          <Box mt={2}>
            <TextField
              fullWidth
              label="To"
              margin="normal"
              variant="outlined"
              required
              value={composeForm.to}
              onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
            />
            <TextField
              fullWidth
              label="Subject"
              margin="normal"
              variant="outlined"
              required
              value={composeForm.subject}
              onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
            />
            <Box mt={2}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Message *
              </Typography>
              <Editor
                apiKey="m1pirpi2qyu2euxtfaggtgfvsw6fd0c9kkha4tg1h8gf352f"
                value={composeForm.body}
                onEditorChange={(content: string) => setComposeForm({ ...composeForm, body: content })}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 
                    'link', 'lists', 'media', 'searchreplace', 'table', 
                    'visualblocks', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                }}
              />
            </Box>
            
            {/* Attachments */}
            <Box mt={2}>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="attachment-upload"
                multiple
                type="file"
                onChange={handleAttachFile}
              />
              <label htmlFor="attachment-upload">
                <Button
                  component="span"
                  size="small"
                  startIcon={<AttachFile />}
              variant="outlined"
                >
                  Attach Files
                </Button>
              </label>
              {attachments.length > 0 && (
                <Box mt={1}>
                  {attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={`${file.name} (${(file.size / 1024).toFixed(2)} KB)`}
                      onDelete={() => handleRemoveAttachment(index)}
                      sx={{ mr: 1, mb: 1 }}
                      icon={<AttachFile />}
                    />
                  ))}
                </Box>
              )}
            </Box>
            
            <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
              <Button 
                onClick={() => {
                  setComposeDialogOpen(false);
                  setComposeForm({ to: '', subject: '', body: '' });
                  setAttachments([]);
                }} 
                disabled={sending}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Send />}
                onClick={() => handleSendEmail(composeForm.body)}
                disabled={sending || !composeForm.to || !composeForm.subject || !composeForm.body}
              >
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Delete Email?
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Are you sure you want to delete this email? This action cannot be undone.
          </Typography>
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Template Create/Edit Dialog */}
      <Dialog 
        open={templateDialogOpen} 
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {selectedTemplate ? 'Edit Template' : 'Create Template'}
          </Typography>
          
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Template Name *"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                    label="Category"
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="welcome">Welcome</MenuItem>
                    <MenuItem value="follow-up">Follow-up</MenuItem>
                    <MenuItem value="meeting">Meeting</MenuItem>
                    <MenuItem value="promotional">Promotional</MenuItem>
                    <MenuItem value="support">Support</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject *"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                  placeholder="Use {{variable_name}} for dynamic content"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="body2">
                    Email Body (HTML) *
                  </Typography>
                  <Tabs value={templateEditorMode} onChange={(_, v) => setTemplateEditorMode(v)} sx={{ minHeight: 'auto' }}>
                    <Tab label="Code" value="code" sx={{ minHeight: 'auto', py: 0.5, px: 1 }} />
                    <Tab label="Preview" value="preview" sx={{ minHeight: 'auto', py: 0.5, px: 1 }} />
                  </Tabs>
                </Box>
                
                {templateEditorMode === 'code' ? (
                  <TextField
                    multiline
                    fullWidth
                    rows={15}
                    value={templateForm.body}
                    onChange={(e) => setTemplateForm({...templateForm, body: e.target.value})}
                    placeholder="Enter HTML content. Use {{variable_name}} for dynamic content."
                    variant="outlined"
                    sx={{ mt: 0 }}
                    InputProps={{
                      style: { fontFamily: 'monospace', fontSize: '13px' }
                    }}
                  />
                ) : (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      mt: 0, 
                      p: 2, 
                      minHeight: '400px', 
                      maxHeight: '400px', 
                      overflow: 'auto',
                      bgcolor: 'background.paper'
                    }}
                    dangerouslySetInnerHTML={{ __html: templateForm.body }}
                  />
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={templateForm.isActive}
                      onChange={(e) => setTemplateForm({...templateForm, isActive: e.target.checked})}
                    />
                  }
                  label="Active Template"
                />
              </Grid>
            </Grid>

            {/* Variable Help */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Available Variables:</strong> Use double curly braces to insert dynamic content.
                <br />
                Examples: <code>{'{{first_name}}'}</code>, <code>{'{{last_name}}'}</code>, <code>{'{{company_name}}'}</code>, <code>{'{{email}}'}</code>
              </Typography>
            </Alert>

            <Box mt={3} display="flex" gap={1} justifyContent="flex-end">
              <Button onClick={() => setTemplateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Save />}
                onClick={handleSaveTemplate}
                disabled={!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.body.trim()}
              >
                {selectedTemplate ? 'Update' : 'Create'} Template
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog 
        open={templatePreviewOpen} 
        onClose={() => setTemplatePreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Template Preview
          </Typography>
          
          {selectedTemplate && (
            <Box mt={2}>
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Subject: {selectedTemplate.subject}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {selectedTemplate.body}
                </Typography>
              </Card>
              
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button onClick={() => setTemplatePreviewOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<ContentCopy />}
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setTemplatePreviewOpen(false);
                  }}
                >
                  Use Template
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
