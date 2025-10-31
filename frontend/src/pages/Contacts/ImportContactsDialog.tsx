import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Paper,
} from '@mui/material';
import { Close, CloudUpload, CheckCircle, Error } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { contactsAPI } from '../../services/api';

interface ImportContactsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportContactsDialog({ open, onClose, onSuccess }: ImportContactsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
  });

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const response = await contactsAPI.import(file);
      setResult(response);
      
      if ((response as any).imported > 0) {
        toast.success(`Successfully imported ${(response as any).imported} contacts`);
        onSuccess();
      }
      
      if ((response as any).errors?.length > 0) {
        toast.warning(`${(response as any).errors.length} contacts failed to import`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to import contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  const downloadTemplate = () => {
    const template = 'firstName,lastName,email,phone,company,jobTitle,status,tags\nJohn,Doe,john@example.com,+1234567890,Acme Corp,CEO,new,vip\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts_template.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Import Contacts
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {!result ? (
          <>
            {/* Instructions */}
            <Alert severity="info" sx={{ mb: 2 }}>
              Upload a CSV file with contact information. Make sure to include at least firstName, lastName, and email columns.
            </Alert>

            <Box mb={2}>
              <Button
                size="small"
                variant="outlined"
                onClick={downloadTemplate}
              >
                Download CSV Template
              </Button>
            </Box>

            {/* Dropzone */}
            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag & drop a CSV file here, or click to select'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported format: CSV
              </Typography>
            </Paper>

            {/* Selected File */}
            {file && (
              <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
                <Typography variant="body2" fontWeight="medium">
                  Selected file:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </Typography>
              </Box>
            )}

            {/* Loading */}
            {loading && (
              <Box mt={2}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" mt={1} textAlign="center">
                  Importing contacts...
                </Typography>
              </Box>
            )}
          </>
        ) : (
          /* Results */
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Import Complete
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" gutterBottom>
                <strong>Successfully imported:</strong> {result.imported} contacts
              </Typography>
              {result.errors?.length > 0 && (
                <Typography variant="body2" color="error">
                  <strong>Failed:</strong> {result.errors.length} contacts
                </Typography>
              )}
            </Box>

            {result.errors?.length > 0 && (
              <Box>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Errors:
                </Typography>
                <Box
                  sx={{
                    maxHeight: 200,
                    overflow: 'auto',
                    bgcolor: 'error.light',
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {result.errors.slice(0, 10).map((error: any, index: number) => (
                    <Typography key={index} variant="caption" display="block" color="error">
                      <Error fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {error.error}
                    </Typography>
                  ))}
                  {result.errors.length > 10 && (
                    <Typography variant="caption" color="error">
                      ... and {result.errors.length - 10} more errors
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {!result ? (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={!file || loading}
            >
              Import
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={handleClose}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

