import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import {
  Box,
  Card,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  Grid,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  InputLabel,
  Select,
  Alert,
} from '@mui/material';
import { ArrowBack, Send, AutoAwesome } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { campaignsAPI, segmentsAPI, aiAPI } from '../../services/api';
import { crmAPI } from '../../services/crm-api';
import { functions } from '../../../firebase-config';
import { httpsCallable } from 'firebase/functions';

const steps = ['Campaign Type', 'Content', 'Recipients', 'Preview', 'Review & Send'];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [segments, setSegments] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectAllContacts, setSelectAllContacts] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email' as 'email' | 'sms',
    subject: '',
    content: '',
    htmlContent: '',
    segmentId: '',
    recipientContactIds: [] as string[],
    scheduledAt: '',
    senderEmail: '',
    senderName: '',
  });

  useEffect(() => {
    fetchSegments();
    fetchContacts();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const getEmailTemplates = httpsCallable(functions, 'getEmailTemplates');
      const result: any = await getEmailTemplates();
      if (result.data.success) {
        setEmailTemplates(result.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Fallback to hardcoded templates if fetch fails
    }
  };

  const fetchSegments = async () => {
    try {
      const response = await segmentsAPI.getAll();
      setSegments(response);
    } catch (error) {
      console.error('Failed to load segments:', error);
      // Don't show error to user, just continue without segments
      setSegments([]);
    }
  };

  const fetchContacts = async () => {
    try {
      // Use crmAPI which fetches contacts with createdById field
      const response = await crmAPI.getContacts();
      setContacts(response);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setContacts([]);
    }
  };

  // Template processing functions - handles both {{variableName}} and {{variable_name}} formats
  const processTemplate = (template: string, contact: any) => {
    if (!template || !contact) return template;
    
    // Handle both camelCase and snake_case variable formats
    return template
      // CamelCase format
      .replace(/\{\{firstName\}\}/g, contact.firstName || '[FirstName]')
      .replace(/\{\{lastName\}\}/g, contact.lastName || '[LastName]')
      .replace(/\{\{email\}\}/g, contact.email || '[Email]')
      .replace(/\{\{company\}\}/g, contact.company || '[Company]')
      .replace(/\{\{jobTitle\}\}/g, contact.jobTitle || '[JobTitle]')
      .replace(/\{\{phone\}\}/g, contact.phone || '[Phone]')
      // Snake_case format (for backward compatibility and template format)
      .replace(/\{\{first_name\}\}/g, contact.firstName || '[FirstName]')
      .replace(/\{\{last_name\}\}/g, contact.lastName || '[LastName]')
      .replace(/\{\{company_name\}\}/g, contact.company || '[Company]')
      .replace(/\{\{job_title\}\}/g, contact.jobTitle || '[JobTitle]')
      .replace(/\{\{sender_name\}\}/g, formData.senderName || 'The Team');
  };

  const getSampleContact = () => {
    // Return a sample contact for preview
    return {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Acme Corporation',
      jobTitle: 'Marketing Manager',
      phone: '+1-555-0123'
    };
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      handleChange('subject', template.subject);
      handleChange('content', template.body);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGenerateContent = async () => {
    if (!formData.name) {
      toast.error('Please enter a campaign name first');
      return;
    }

    setGeneratingContent(true);
    try {
      if (formData.type === 'email') {
        const response = await aiAPI.generateEmail({
          purpose: formData.description || formData.name,
          tone: 'professional',
        });
        handleChange('subject', (response as any).subject);
        handleChange('content', (response as any).body);
        toast.success('Content generated successfully!');
      } else {
        const response = await aiAPI.generateSms({
          purpose: formData.description || formData.name,
          maxLength: 160,
        });
        handleChange('content', response as any);
        toast.success('SMS content generated!');
      }
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate that recipients are selected
      if (!formData.segmentId && (!formData.recipientContactIds || formData.recipientContactIds.length === 0)) {
        toast.error('Please select recipients for the campaign');
        setActiveStep(2); // Go back to recipients step
        return;
      }

      // Validate email sender details for email campaigns
      if (formData.type === 'email') {
        if (!formData.senderName || !formData.senderEmail) {
          toast.error('Please enter sender name and email address');
          setActiveStep(1); // Go back to content step
          return;
        }
      }

      // Prepare campaign data
      const campaignData = {
        ...formData,
        // Remove htmlContent if it's the same as content (TinyMCE already stores HTML in content)
        htmlContent: formData.htmlContent || formData.content,
      };

      await campaignsAPI.create(campaignData);
      toast.success('Campaign created successfully');
      navigate('/campaigns');
    } catch (error: any) {
      console.error('Campaign creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create campaign';
      toast.error(errorMessage);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Campaign Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Campaign Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Summer Sale 2024"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Campaign Type</FormLabel>
                  <RadioGroup
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    row
                  >
                    <FormControlLabel value="email" control={<Radio />} label="Email" />
                    <FormControlLabel value="sms" control={<Radio />} label="SMS" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Campaign Content</Typography>
              <Button
                variant="outlined"
                startIcon={<AutoAwesome />}
                onClick={handleGenerateContent}
                disabled={generatingContent}
              >
                {generatingContent ? 'Generating...' : 'Generate with AI'}
              </Button>
            </Box>
            <Grid container spacing={3}>
              {/* Email Templates */}
              {formData.type === 'email' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Choose a Template (Optional)
                  </Typography>
                  <Grid container spacing={2}>
                    {emailTemplates.map((template) => (
                      <Grid item xs={6} sm={3} key={template.id}>
                        <Card 
                          variant={selectedTemplate === template.id ? "elevation" : "outlined"}
                          sx={{ 
                            cursor: 'pointer', 
                            p: 2,
                            border: selectedTemplate === template.id ? 2 : 1,
                            borderColor: selectedTemplate === template.id ? 'primary.main' : 'divider'
                          }}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            {template.name}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              {formData.type === 'email' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Subject Line"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="Your email subject..."
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                {formData.type === 'email' ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Email Content
                    </Typography>
                    <Editor
                      apiKey="m1pirpi2qyu2euxtfaggtgfvsw6fd0c9kkha4tg1h8gf352f"
                      value={formData.content}
                      onEditorChange={(content: string) => {
                        handleChange('content', content);
                        // Also save HTML content for rich text emails
                        handleChange('htmlContent', content);
                      }}
                      init={{
                        height: 400,
                        menubar: true,
                        plugins: [
                          'anchor', 'autolink', 'charmap', 'code', 'codesample', 'emoticons', 'fullscreen',
                          'help', 'image', 'link', 'lists', 'media', 'preview', 'searchreplace', 'table',
                          'visualblocks', 'visualchars', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | code preview fullscreen | removeformat',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                        branding: false,
                        promotion: false,
                        font_family_formats: 'Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats',
                        block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre',
                      }}
                    />
                  </Box>
                ) : (
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={6}
                    label="SMS Message"
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Your SMS message..."
                    helperText={`${formData.content.length}/160 characters`}
                  />
                )}
              </Grid>
              
              {formData.type === 'email' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Sender Name"
                      value={formData.senderName}
                      onChange={(e) => handleChange('senderName', e.target.value)}
                      placeholder="e.g., John Doe"
                      helperText="Name shown to recipients"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      type="email"
                      label="Sender Email"
                      value={formData.senderEmail}
                      onChange={(e) => handleChange('senderEmail', e.target.value)}
                      placeholder="e.g., john@example.com"
                      helperText="Email address for replies"
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <Box bgcolor="info.light" p={2} borderRadius={1}>
                  <Typography variant="caption" fontWeight="medium">
                    Available Variables:
                  </Typography>
                  <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                    {['{{firstName}}', '{{lastName}}', '{{email}}', '{{company}}', '{{jobTitle}}'].map((v) => (
                      <Chip key={v} label={v} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Recipients
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Filter by Tags"
                  value={formData.segmentId}
                  onChange={(e) => handleChange('segmentId', e.target.value)}
                  helperText="Filter contacts by tags"
                >
                  <MenuItem value="">
                    <em>All Contacts ({contacts.length} contacts)</em>
                  </MenuItem>
                  <MenuItem value="imported">
                    <em>Imported Contacts ({contacts.filter(c => c.tags?.includes('imported')).length} contacts)</em>
                  </MenuItem>
                  <MenuItem value="prospect">
                    <em>Prospects ({contacts.filter(c => c.category === 'prospect').length} contacts)</em>
                  </MenuItem>
                  <MenuItem value="new">
                    <em>New Contacts ({contacts.filter(c => c.status === 'new').length} contacts)</em>
                  </MenuItem>
                  {segments.map((segment) => (
                    <MenuItem key={segment.id} value={segment.id}>
                      {segment.name} ({segment.contactCount || 0} contacts)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2">
                    Or Select Individual Contacts
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <input
                      type="checkbox"
                      checked={selectAllContacts}
                      onChange={(e) => {
                        setSelectAllContacts(e.target.checked);
                        if (e.target.checked) {
                          handleChange('recipientContactIds', contacts.map(c => c.id));
                        } else {
                          handleChange('recipientContactIds', []);
                        }
                      }}
                    />
                    <Typography variant="body2">
                      Select All ({contacts.length} contacts)
                    </Typography>
                  </Box>
                </Box>
                <FormControl fullWidth>
                  <InputLabel>Select Contacts</InputLabel>
                  <Select
                    multiple
                    value={formData.recipientContactIds}
                    onChange={(e) => {
                      handleChange('recipientContactIds', e.target.value);
                      setSelectAllContacts(e.target.value.length === contacts.length);
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const contact = contacts.find(c => c.id === value);
                          return (
                            <Chip
                              key={value}
                              label={contact ? `${contact.firstName} ${contact.lastName}` : value}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {contacts.map((contact) => (
                      <MenuItem key={contact.id} value={contact.id}>
                        <Box>
                          <Typography variant="body2">
                            {contact.firstName} {contact.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contact.email} • {contact.company || 'No Company'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Schedule Send Time (Optional)"
                  value={formData.scheduledAt}
                  onChange={(e) => handleChange('scheduledAt', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave empty to save as draft"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview Email
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Subject Line Preview
                </Typography>
                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body1">
                    {processTemplate(formData.subject, getSampleContact())}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Email Content Preview
                </Typography>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography 
                    variant="body2" 
                    component="div"
                    dangerouslySetInnerHTML={{ 
                      __html: processTemplate(formData.content, getSampleContact()) 
                    }}
                  />
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  This is how your email will appear to recipients. Variables like {'{{firstName}}'} will be replaced with actual contact information.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Campaign
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Campaign Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.name}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" mt={2}>
                    Type
                  </Typography>
                  <Chip label={formData.type.toUpperCase()} size="small" sx={{ mb: 2 }} />

                  {formData.type === 'email' && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" mt={2}>
                        Subject
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formData.subject}
                      </Typography>
                    </>
                  )}

                  <Typography variant="subtitle2" color="text.secondary" mt={2}>
                    Content Preview
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: 'grey.50',
                      p: 2,
                      borderRadius: 1,
                      maxHeight: 200,
                      overflow: 'auto',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      component="div"
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary" mt={2}>
                    Recipients
                  </Typography>
                  <Typography variant="body1">
                    {formData.segmentId
                      ? segments.find((s) => s.id === formData.segmentId)?.name
                      : 'All Contacts'}
                  </Typography>

                  {formData.scheduledAt && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" mt={2}>
                        Scheduled For
                      </Typography>
                      <Typography variant="body1">
                        {(() => {
                          const scheduledDate = new Date(formData.scheduledAt);
                          return !isNaN(scheduledDate.getTime()) 
                            ? scheduledDate.toLocaleString() 
                            : 'Invalid date';
                        })()}
                      </Typography>
                    </>
                  )}
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/campaigns')}
        sx={{ mb: 2 }}
      >
        Back to Campaigns
      </Button>

      <Typography variant="h4" fontWeight="bold" mb={3}>
        Create New Campaign
      </Typography>

      <Card sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            startIcon={activeStep === steps.length - 1 ? <Send /> : undefined}
            disabled={
              (activeStep === 0 && !formData.name) ||
              (activeStep === 1 && !formData.content)
            }
          >
            {activeStep === steps.length - 1 ? 'Create Campaign' : 'Next'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
