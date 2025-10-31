const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'quick-dev-secret-12345';

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// In-memory storage (for demo)
const users = [];
const contacts = [];
const campaigns = [];

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'sales_rep'
    };
    
    users.push(user);
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Contacts routes
app.get('/api/contacts', authenticateToken, (req, res) => {
  res.json(contacts);
});

app.post('/api/contacts', authenticateToken, (req, res) => {
  const contact = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  contacts.push(contact);
  res.json(contact);
});

app.get('/api/contacts/:id', authenticateToken, (req, res) => {
  const contact = contacts.find(c => c.id === req.params.id);
  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }
  res.json(contact);
});

// Campaigns routes
app.get('/api/campaigns', authenticateToken, (req, res) => {
  res.json(campaigns);
});

app.post('/api/campaigns', authenticateToken, (req, res) => {
  const campaign = {
    id: Date.now().toString(),
    ...req.body,
    status: 'draft',
    totalRecipients: 0,
    sentCount: 0,
    openedCount: 0,
    clickedCount: 0,
    createdAt: new Date().toISOString()
  };
  campaigns.push(campaign);
  res.json(campaign);
});

// Analytics routes
app.get('/api/analytics/dashboard', authenticateToken, (req, res) => {
  res.json({
    contacts: {
      total: contacts.length,
      newThisMonth: contacts.filter(c => 
        new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      avgLeadScore: 75
    },
    campaigns: {
      total: campaigns.length,
      totalSent: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
      openRate: 25.5,
      clickThroughRate: 8.2
    },
    calls: {
      total: 0,
      completed: 0,
      avgDuration: 0
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Backend running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
  console.log(`✅ Ready to accept requests!`);
});

module.exports = app;
