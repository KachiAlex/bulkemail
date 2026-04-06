import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Toolbar,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatListBulleted,
  FormatListNumbered,
  Link,
  Code,
  Preview,
  Edit,
} from '@mui/icons-material';

interface CustomEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  showToolbar?: boolean;
}

const CustomEditor: React.FC<CustomEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing your email content...',
  height = 400,
  showToolbar = true,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [fontSize, setFontSize] = useState('14px');
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = before + selectedText + after;
    
    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const wrapText = (tag: string) => {
    insertText(`<${tag}>`, `</${tag}>`);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      insertText(`<a href="${url}">`, '</a>');
    }
  };

  const insertList = (ordered: boolean) => {
    const tag = ordered ? 'ol' : 'ul';
    insertText(`<${tag}>\n<li>`, `</li>\n<li>Item 2</li>\n</${tag}>`);
  };

  const getPreviewHtml = () => {
    return `
      <div style="font-family: ${fontFamily}; font-size: ${fontSize}; line-height: 1.6; padding: 20px;">
        ${value}
      </div>
    `;
  };

  const commonTemplates = [
    { label: 'Greeting', html: '<p>Dear {{name}},</p>' },
    { label: 'Closing', html: '<p>Best regards,<br>{{your_name}}</p>' },
    { label: 'Button', html: '<a href="{{link}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">{{button_text}}</a>' },
    { label: 'Divider', html: '<hr style="margin: 20px 0;">' },
    { label: 'Header', html: '<h1>{{header_text}}</h1>' },
    { label: 'Subheader', html: '<h2>{{subheader_text}}</h2>' },
  ];

  if (isPreview) {
    return (
      <Box>
        <Toolbar sx={{ bgcolor: 'grey.100', mb: 1 }}>
          <Button
            startIcon={<Edit />}
            onClick={() => setIsPreview(false)}
            variant="contained"
            size="small"
          >
            Edit
          </Button>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            Preview Mode
          </Typography>
        </Toolbar>
        <Paper
          sx={{
            height,
            p: 2,
            overflow: 'auto',
            border: '1px solid #ddd',
            bgcolor: 'white',
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {showToolbar && (
        <Toolbar sx={{ bgcolor: 'grey.100', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <ToggleButtonGroup size="small">
            <ToggleButton onClick={() => wrapText('strong')} title="Bold">
              <FormatBold />
            </ToggleButton>
            <ToggleButton onClick={() => wrapText('em')} title="Italic">
              <FormatItalic />
            </ToggleButton>
            <ToggleButton onClick={() => wrapText('u')} title="Underline">
              <FormatUnderlined />
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem />

          <ToggleButtonGroup size="small">
            <ToggleButton onClick={() => wrapText('p')} title="Align Left">
              <FormatAlignLeft />
            </ToggleButton>
            <ToggleButton onClick={() => wrapText('center')} title="Align Center">
              <FormatAlignCenter />
            </ToggleButton>
            <ToggleButton onClick={() => wrapText('right')} title="Align Right">
              <FormatAlignRight />
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem />

          <ToggleButtonGroup size="small">
            <ToggleButton onClick={() => insertList(false)} title="Bullet List">
              <FormatListBulleted />
            </ToggleButton>
            <ToggleButton onClick={() => insertList(true)} title="Numbered List">
              <FormatListNumbered />
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem />

          <IconButton onClick={insertLink} title="Insert Link">
            <Link />
          </IconButton>
          <IconButton onClick={() => wrapText('code')} title="Code">
            <Code />
          </IconButton>
          <IconButton onClick={() => setIsPreview(true)} title="Preview">
            <Preview />
          </IconButton>

          <Divider orientation="vertical" flexItem />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Font Size</InputLabel>
            <Select
              value={fontSize}
              label="Font Size"
              onChange={(e) => setFontSize(e.target.value)}
            >
              <MenuItem value="12px">12px</MenuItem>
              <MenuItem value="14px">14px</MenuItem>
              <MenuItem value="16px">16px</MenuItem>
              <MenuItem value="18px">18px</MenuItem>
              <MenuItem value="20px">20px</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Font Family</InputLabel>
            <Select
              value={fontFamily}
              label="Font Family"
              onChange={(e) => setFontFamily(e.target.value)}
            >
              <MenuItem value="Arial, sans-serif">Arial</MenuItem>
              <MenuItem value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</MenuItem>
              <MenuItem value="Georgia, serif">Georgia</MenuItem>
              <MenuItem value="'Times New Roman', serif">Times New Roman</MenuItem>
              <MenuItem value="'Courier New', monospace">Courier New</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Quick Templates:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {commonTemplates.map((template) => (
            <Chip
              key={template.label}
              label={template.label}
              onClick={() => insertText(template.html)}
              variant="outlined"
              size="small"
              clickable
            />
          ))}
        </Box>
      </Box>

      <TextField
        textareaRef={textareaRef}
        multiline
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{
          '& .MuiInputBase-root': {
            height,
            alignItems: 'flex-start',
            fontFamily,
            fontSize,
          },
          '& .MuiInputBase-input': {
            height: 'auto !important',
            overflow: 'auto !important',
            resize: 'none',
          },
        }}
        InputProps={{
          sx: {
            fontFamily,
            fontSize,
          },
        }}
      />

      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 Tip: Use the toolbar buttons to format text, or type HTML directly. 
          Available variables: {`{{name}}`, `{{email}}`, `{{company}}`, `{{your_name}}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default CustomEditor;
