import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Fade,
} from '@mui/material';
import {
  Contacts,
  Phone,
  Speed,
  Security,
  Lock,
  Person,
  Email,
  ArrowBack,
  ArrowForward,
  PlayArrow,
  Pause,
} from '@mui/icons-material';

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Banner slides data
  const bannerSlides = [
    {
      id: 1,
      title: "Unify Outreach. Amplify Conversion.",
      subtitle: "AI-Powered CRM for Modern Sales Teams",
      description: "PANDI AI Powered CRM centralizes contacts, campaigns, calls, and automation—using AI to score leads, summarize conversations, and recommend the next best action.",
      backgroundImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      primaryAction: "Get Started",
      secondaryAction: "Request Demo",
      primaryColor: "#6a1b9a",
      overlay: "rgba(106, 27, 154, 0.8)"
    },
    {
      id: 2,
      title: "AI That Works Where It Matters",
      subtitle: "Intelligent Automation for Sales Success",
      description: "Prioritize your pipeline with predictive scoring, summarize calls with sentiment analysis, and generate on-brand emails in seconds.",
      backgroundImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      primaryAction: "See AI Features",
      secondaryAction: "Watch Demo",
      primaryColor: "#7b1fa2",
      overlay: "rgba(123, 31, 162, 0.8)"
    },
    {
      id: 3,
      title: "Compliance-Aware Automation",
      subtitle: "Built with Privacy and Security First",
      description: "Modern controls to safeguard your business and customers. GDPR compliance, encrypted storage, and role-based access built-in.",
      backgroundImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      primaryAction: "Learn More",
      secondaryAction: "Security Details",
      primaryColor: "#8e24aa",
      overlay: "rgba(142, 36, 170, 0.8)"
    },
    {
      id: 4,
      title: "25% Faster Follow-ups",
      subtitle: "Proven Results with AI-Powered CRM",
      description: "Join thousands of sales teams who've increased conversion rates by 10-20% and achieved 99.9% uptime with our platform.",
      backgroundImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      primaryAction: "Start Free Trial",
      secondaryAction: "View Case Studies",
      primaryColor: "#9c27b0",
      overlay: "rgba(156, 39, 176, 0.8)"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, bannerSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const features = [
    {
      icon: <Contacts sx={{ fontSize: 48, color: '#6a1b9a' }} />,
      title: 'Contacts & Campaigns',
      description: 'CRUD, import/export CSV, segmentation, lists, and workflows.',
      color: '#6a1b9a',
    },
    {
      icon: <Email sx={{ fontSize: 48, color: '#7b1fa2' }} />,
      title: 'Bulk Messaging',
      description: 'Personalized email/SMS blasts with analytics and A/B tests.',
      color: '#7b1fa2',
    },
    {
      icon: <Phone sx={{ fontSize: 48, color: '#8e24aa' }} />,
      title: 'Telephony',
      description: 'Click-to-call, call logging, recordings, and disposition notes.',
      color: '#8e24aa',
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: '#9c27b0' }} />,
      title: 'AI Capabilities',
      description: 'Lead scoring, follow-up prompts, conversation summarization.',
      color: '#9c27b0',
    },
  ];

  const complianceFeatures = [
    {
      icon: <Lock sx={{ fontSize: 48, color: '#6a1b9a' }} />,
      title: 'GDPR',
      description: 'Data subject rights, consent management, and export/delete workflows.',
      color: '#6a1b9a',
    },
    {
      icon: <Security sx={{ fontSize: 48, color: '#7b1fa2' }} />,
      title: 'Security & Encryption',
      description: 'Encrypted storage and transit, secrets management, and audit trails.',
      color: '#7b1fa2',
    },
    {
      icon: <Person sx={{ fontSize: 48, color: '#8e24aa' }} />,
      title: 'RBAC',
      description: 'Role-based access, least-privilege defaults, and team permissions.',
      color: '#8e24aa',
    },
  ];

  const integrations = [
    { name: 'Twilio', color: '#e91e63', borderColor: '#e91e63' },
    { name: 'SendGrid', color: '#00acc1', borderColor: '#00acc1' },
    { name: 'SES', color: '#2196f3', borderColor: '#2196f3' },
    { name: 'OpenAI', color: '#9c27b0', borderColor: '#9c27b0' },
    { name: 'Anthropic', color: '#5e35b1', borderColor: '#5e35b1' },
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f5ff 50%, #ffffff 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(106, 27, 154, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(156, 39, 176, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Banner Carousel */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '50vh', sm: '55vh', md: '60vh' },
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(106, 27, 154, 0.3)',
          animation: 'slideInDown 1s ease-out',
          '@keyframes slideInDown': {
            '0%': {
              transform: 'translateY(-100px)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1,
            },
          },
        }}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${bannerSlides[currentSlide].backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'opacity 0.8s ease-in-out',
          }}
        />
        
        {/* Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: bannerSlides[currentSlide].overlay,
            zIndex: 1,
          }}
        />

        {/* Sign In Button */}
        <Button
          variant="outlined"
          onClick={() => navigate('/login')}
          sx={{
            position: 'absolute',
            top: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 3,
            borderColor: 'white',
            color: 'white',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              borderColor: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-2px)',
            },
            px: 3,
            py: 1,
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          }}
        >
          Sign In
        </Button>

        {/* Content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Container maxWidth="lg">
            <Fade in={true} timeout={1000}>
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <Chip 
                  label="New" 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white', 
                    mb: 3,
                    fontWeight: 'bold',
                    backdropFilter: 'blur(10px)',
                  }} 
                />
                <Typography
                  variant="h1"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                    fontWeight: 'bold',
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {bannerSlides[currentSlide].title}
                </Typography>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
                    fontWeight: '600',
                    mb: 2,
                    opacity: 0.9,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  {bannerSlides[currentSlide].subtitle}
                </Typography>
                <Typography
                  variant="h6"
                  component="p"
                  sx={{
                    mb: 4,
                    maxWidth: '800px',
                    mx: 'auto',
                    lineHeight: 1.7,
                    opacity: 0.9,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  }}
                >
                  {bannerSlides[currentSlide].description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      bgcolor: bannerSlides[currentSlide].primaryColor,
                      color: 'white',
                      '&:hover': { 
                        bgcolor: bannerSlides[currentSlide].primaryColor,
                        filter: 'brightness(1.1)',
                      },
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                  >
                    {bannerSlides[currentSlide].primaryAction}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': { 
                        borderColor: 'white', 
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {bannerSlides[currentSlide].secondaryAction}
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Container>
        </Box>

        {/* Navigation Arrows */}
        <IconButton
          onClick={prevSlide}
          sx={{
            position: 'absolute',
            left: { xs: 16, sm: 32 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
            },
            backdropFilter: 'blur(10px)',
          }}
        >
          <ArrowBack />
        </IconButton>
        <IconButton
          onClick={nextSlide}
          sx={{
            position: 'absolute',
            right: { xs: 16, sm: 32 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
            },
            backdropFilter: 'blur(10px)',
          }}
        >
          <ArrowForward />
        </IconButton>

        {/* Play/Pause Button */}
        <IconButton
          onClick={() => setIsPlaying(!isPlaying)}
          sx={{
            position: 'absolute',
            top: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 24 },
            zIndex: 3,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
            },
            backdropFilter: 'blur(10px)',
          }}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>

        {/* Dots Navigation */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 16, sm: 24 },
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            gap: 1,
          }}
        >
          {bannerSlides.map((_, index) => (
            <Box
              key={index}
              onClick={() => goToSlide(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: index === currentSlide ? 'white' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Feature Cards Section */}
      <Box 
        sx={{ 
          py: 8, 
          background: 'linear-gradient(135deg, #f8f5ff 0%, #ffffff 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(135deg, rgba(106, 27, 154, 0.1) 0%, transparent 100%)',
          }
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              textAlign: 'center', 
              mb: 6,
              animation: 'fadeInUp 0.8s ease-out',
              '@keyframes fadeInUp': {
                '0%': {
                  transform: 'translateY(30px)',
                  opacity: 0,
                },
                '100%': {
                  transform: 'translateY(0)',
                  opacity: 1,
                },
              },
            }}
          >
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                background: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Everything You Need to Succeed
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Powerful features designed for modern sales teams
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '16px',
                    border: '1px solid rgba(106, 27, 154, 0.1)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                    animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(106, 27, 154, 0.2)',
                      border: '1px solid rgba(106, 27, 154, 0.3)',
                    },
                    '@keyframes fadeInUp': {
                      '0%': {
                        transform: 'translateY(30px)',
                        opacity: 0,
                      },
                      '100%': {
                        transform: 'translateY(0)',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box 
                      sx={{ 
                        mb: 2,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)',
                        },
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 'bold', 
                        mb: 1,
                        color: feature.color,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* AI & Compliance Sections */}
      <Box sx={{ py: 8, bgcolor: '#fafafa' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* AI Section */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                  borderRadius: '20px',
                  p: 4,
                  height: '100%',
                  boxShadow: '0 10px 30px rgba(106, 27, 154, 0.1)',
                  border: '1px solid rgba(106, 27, 154, 0.1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'slideInLeft 0.8s ease-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(106, 27, 154, 0.2)',
                  },
                  '@keyframes slideInLeft': {
                    '0%': {
                      transform: 'translateX(-50px)',
                      opacity: 0,
                    },
                    '100%': {
                      transform: 'translateX(0)',
                      opacity: 1,
                    },
                  },
                }}
              >
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 3,
                    background: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  AI that works where it matters
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: '#6a1b9a', 
                        mt: 1,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)', opacity: 1 },
                          '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                          '100%': { transform: 'scale(1)', opacity: 1 },
                        },
                      }} 
                    />
                    <Typography variant="body1">
                      Prioritize your pipeline with predictive scoring.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: '#7b1fa2', 
                        mt: 1,
                        animation: 'pulse 2s infinite 0.5s',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)', opacity: 1 },
                          '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                          '100%': { transform: 'scale(1)', opacity: 1 },
                        },
                      }} 
                    />
                    <Typography variant="body1">
                      Summarize calls and threads with sentiment and intent.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: '#8e24aa', 
                        mt: 1,
                        animation: 'pulse 2s infinite 1s',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)', opacity: 1 },
                          '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                          '100%': { transform: 'scale(1)', opacity: 1 },
                        },
                      }} 
                    />
                    <Typography variant="body1">
                      Generate on-brand emails and follow-ups in seconds.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Compliance Section */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                  borderRadius: '20px',
                  p: 4,
                  height: '100%',
                  boxShadow: '0 10px 30px rgba(106, 27, 154, 0.1)',
                  border: '1px solid rgba(106, 27, 154, 0.1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'slideInRight 0.8s ease-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(106, 27, 154, 0.2)',
                  },
                  '@keyframes slideInRight': {
                    '0%': {
                      transform: 'translateX(50px)',
                      opacity: 0,
                    },
                    '100%': {
                      transform: 'translateX(0)',
                      opacity: 1,
                    },
                  },
                }}
              >
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 3,
                    background: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Compliance-aware Automation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Built with guardrails and best-in-class providers to respect privacy, security, 
                  and responsible AI usage.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Compliance & Security Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              Compliance & Security by Design
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Modern controls to safeguard your business and customers.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {complianceFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Metrics Section */}
      <Box sx={{ py: 8, bgcolor: '#fafafa' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography
                  variant="h2"
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    color: '#9c27b0',
                    mb: 1,
                  }}
                >
                  25%
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Faster Follow-ups
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  via AI prompts and recommendations
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography
                  variant="h2"
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    color: '#9c27b0',
                    mb: 1,
                  }}
                >
                  10-20%
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Uplift in Conversion
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  with targeted outreach and scoring
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography
                  variant="h2"
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    color: '#9c27b0',
                    mb: 1,
                  }}
                >
                  99.9%
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Uptime for Workflows
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  reliable messaging and calls
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Integrations Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Plug into your favorite providers
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Prepped for messaging, voice, and AI services out-of-the-box.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {integrations.map((integration, index) => (
              <Chip
                key={index}
                label={integration.name}
                sx={{
                  border: `2px solid ${integration.borderColor}`,
                  color: integration.color,
                  fontSize: '1rem',
                  height: 48,
                  px: 2,
                  fontWeight: 'bold',
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 12, bgcolor: '#fafafa' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              Ready to unify outreach and accelerate revenue?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Start your journey with PANDI AI Powered CRM today.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: '#212121',
                  color: 'white',
                  '&:hover': { bgcolor: '#424242' },
                  px: 5,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: '#212121',
                  color: '#212121',
                  '&:hover': { borderColor: '#424242', bgcolor: 'white' },
                  px: 5,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Talk to Sales
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: '#212121', color: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Made by <strong>MGX</strong>
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
