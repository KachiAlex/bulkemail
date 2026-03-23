import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { 
  Close, 
  Search, 
  PersonAdd, 
  LinkedIn, 
  Email, 
  Phone, 
  Business, 
  Work,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { contactsApi } from '../../services/contactsApi';

interface ExtractLeadsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ExtractedLead {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  linkedInUrl?: string;
  source?: string;
  provider?: string;
}

export default function ExtractLeadsDialog({ open, onClose, onSuccess }: ExtractLeadsDialogProps) {
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [linkedInUrls, setLinkedInUrls] = useState<string[]>([]);
  const [provider, setProvider] = useState<'lusha' | 'apollo' | 'hunter'>('lusha');
  const [loading, setLoading] = useState(false);
  const [extractedLead, setExtractedLead] = useState<ExtractedLead | null>(null);
  const [extractedLeads, setExtractedLeads] = useState<Array<{url: string, lead: ExtractedLead, success: boolean, error?: string}>>([]);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());

  const handleExtractSingle = async () => {
    if (!linkedInUrl.trim()) {
      toast.error('Please enter a LinkedIn URL');
      return;
    }

    setLoading(true);
    setExtractedLead(null);
    
    try {
      // Placeholder: Replace with backend API when available
      toast.info('LinkedIn extraction will be available in the next update');
    } catch (error: any) {
      console.error('Error extracting lead:', error);
      toast.error(error.message || 'Failed to extract lead');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractBulk = async () => {
    if (linkedInUrls.length === 0) {
      toast.error('Please add LinkedIn URLs');
      return;
    }

    setLoading(true);
    setExtractedLeads([]);
    
    try {
      // Placeholder: Replace with backend API when available
      toast.info('Bulk LinkedIn extraction will be available in the next update');
    } catch (error: any) {
      console.error('Error bulk extracting leads:', error);
      toast.error(error.message || 'Failed to bulk extract leads');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUrl = () => {
    if (linkedInUrl.trim() && !linkedInUrls.includes(linkedInUrl.trim())) {
      setLinkedInUrls([...linkedInUrls, linkedInUrl.trim()]);
      setLinkedInUrl('');
    }
  };

  const handleRemoveUrl = (index: number) => {
    setLinkedInUrls(linkedInUrls.filter((_, i) => i !== index));
  };

  const handleImportLead = async (lead: ExtractedLead) => {
    try {
      await contactsApi.create({
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        jobTitle: lead.jobTitle || '',
        status: 'new',
        category: 'lead',
        tags: ['linkedin_extracted'],
        source: lead.source || 'linkedin_extraction'
      });
      toast.success('Lead imported to contacts!');
      onSuccess();
    } catch (error: any) {
      console.error('Error importing lead:', error);
      toast.error(error.message || 'Failed to import lead');
    }
  };

  const handleImportSelected = async () => {
    if (selectedLeads.size === 0) {
      toast.error('Please select leads to import');
      return;
    }

    setLoading(true);
    let imported = 0;
    let failed = 0;

    try {
      for (const leadIndex of selectedLeads) {
        const result = extractedLeads[leadIndex];
        if (result.success && result.lead) {
          try {
            await handleImportLead(result.lead);
            imported++;
          } catch {
            failed++;
          }
        }
      }
      toast.success(`Imported ${imported} leads${failed > 0 ? `, ${failed} failed` : ''}`);
      setSelectedLeads(new Set());
      onSuccess();
    } catch (error: any) {
      toast.error('Failed to import leads');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLinkedInUrl('');
    setLinkedInUrls([]);
    setExtractedLead(null);
    setExtractedLeads([]);
    setSelectedLeads(new Set());
    setMode('single');
    onClose();
  };

  const toggleLeadSelection = (index: number) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedLeads(newSelected);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            Extract Leads from LinkedIn
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Mode Selection */}
        <Box mb={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Extraction Mode</InputLabel>
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'single' | 'bulk')}
            >
              <MenuItem value="single">Single Profile</MenuItem>
              <MenuItem value="bulk">Bulk Extraction</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Provider Selection */}
        <Box mb={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Data Provider</InputLabel>
            <Select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'lusha' | 'apollo' | 'hunter')}
            >
              <MenuItem value="lusha">Lusha</MenuItem>
              <MenuItem value="apollo">Apollo.io</MenuItem>
              <MenuItem value="hunter">Hunter.io</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" mt={0.5}>
            API key must be configured in Firebase Functions for {provider}
          </Typography>
        </Box>

        {mode === 'single' ? (
          <>
            {/* Single URL Input */}
            <Box mb={3}>
              <TextField
                fullWidth
                label="LinkedIn Profile URL"
                placeholder="https://www.linkedin.com/in/username"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                InputProps={{
                  startAdornment: <LinkedIn sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                helperText="Enter a LinkedIn profile URL (e.g., linkedin.com/in/username)"
              />
            </Box>

            {/* Extract Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={handleExtractSingle}
              disabled={loading || !linkedInUrl.trim()}
              startIcon={<Search />}
              sx={{ mb: 3 }}
            >
              Extract Lead
            </Button>

            {/* Loading */}
            {loading && (
              <Box mb={3}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" mt={1} textAlign="center">
                  Extracting lead data...
                </Typography>
              </Box>
            )}

            {/* Extracted Lead Result */}
            {extractedLead && (
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      Extracted Lead
                    </Typography>
                    <Chip 
                      label={extractedLead.provider?.toUpperCase() || 'EXTRACTED'} 
                      color="primary" 
                      size="small"
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {extractedLead.firstName} {extractedLead.lastName}
                      </Typography>
                    </Grid>

                    {extractedLead.email && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Email fontSize="small" />
                          {extractedLead.email}
                        </Typography>
                      </Grid>
                    )}

                    {extractedLead.phone && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Phone fontSize="small" />
                          {extractedLead.phone}
                        </Typography>
                      </Grid>
                    )}

                    {extractedLead.company && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Company
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Business fontSize="small" />
                          {extractedLead.company}
                        </Typography>
                      </Grid>
                    )}

                    {extractedLead.jobTitle && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Job Title
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Work fontSize="small" />
                          {extractedLead.jobTitle}
                        </Typography>
                      </Grid>
                    )}

                    {extractedLead.linkedInUrl && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          LinkedIn
                        </Typography>
                        <Typography variant="body1" component="a" href={extractedLead.linkedInUrl} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none', color: 'primary.main' }}>
                          {extractedLead.linkedInUrl}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  <Box mt={2} display="flex" gap={1}>
                    <Button
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => handleImportLead(extractedLead)}
                    >
                      Import to Contacts
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Bulk URL Input */}
            <Box mb={3}>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  label="LinkedIn Profile URL"
                  placeholder="https://www.linkedin.com/in/username"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  InputProps={{
                    startAdornment: <LinkedIn sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddUrl}
                  disabled={!linkedInUrl.trim() || linkedInUrls.includes(linkedInUrl.trim())}
                >
                  Add
                </Button>
              </Box>

              {/* URL List */}
              {linkedInUrls.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="body2" fontWeight="medium" mb={1}>
                    URLs to Extract ({linkedInUrls.length})
                  </Typography>
                  <Stack spacing={1}>
                    {linkedInUrls.map((url, index) => (
                      <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ flex: 1, mr: 1 }} noWrap>
                          {url}
                        </Typography>
                        <IconButton size="small" onClick={() => handleRemoveUrl(index)}>
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Box>

            {/* Extract Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={handleExtractBulk}
              disabled={loading || linkedInUrls.length === 0}
              startIcon={<Search />}
              sx={{ mb: 3 }}
            >
              Extract {linkedInUrls.length} Lead(s)
            </Button>

            {/* Loading */}
            {loading && (
              <Box mb={3}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" mt={1} textAlign="center">
                  Extracting leads... This may take a few minutes
                </Typography>
              </Box>
            )}

            {/* Bulk Results */}
            {extractedLeads.length > 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Extraction Results ({extractedLeads.length})
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PersonAdd />}
                    onClick={handleImportSelected}
                    disabled={selectedLeads.size === 0}
                  >
                    Import Selected ({selectedLeads.size})
                  </Button>
                </Box>

                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedLeads.size > 0 && selectedLeads.size < extractedLeads.length}
                            checked={extractedLeads.length > 0 && selectedLeads.size === extractedLeads.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeads(new Set(extractedLeads.map((_, i) => i)));
                              } else {
                                setSelectedLeads(new Set());
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell>Job Title</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {extractedLeads.map((result, index) => (
                        <TableRow key={index} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedLeads.has(index)}
                              onChange={() => toggleLeadSelection(index)}
                              disabled={!result.success}
                            />
                          </TableCell>
                          <TableCell>
                            {result.success ? (
                              <Chip icon={<CheckCircle />} label="Success" color="success" size="small" />
                            ) : (
                              <Chip icon={<ErrorIcon />} label={result.error || 'Failed'} color="error" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            {result.success && result.lead ? (
                              `${result.lead.firstName || ''} ${result.lead.lastName || ''}`.trim() || 'N/A'
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>{result.success && result.lead?.email || 'N/A'}</TableCell>
                          <TableCell>{result.success && result.lead?.phone || 'N/A'}</TableCell>
                          <TableCell>{result.success && result.lead?.company || 'N/A'}</TableCell>
                          <TableCell>{result.success && result.lead?.jobTitle || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

