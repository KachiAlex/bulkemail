/**
 * Email validation and verification utilities
 */

// Basic email format validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates email format
 * @param email Email address to validate
 * @returns boolean indicating if email format is valid
 */
export const isValidEmailFormat = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Advanced email validation with syntax checking
 * @param email Email address to validate
 * @returns object with validation result and details
 */
export const validateEmail = async (email: string): Promise<{
  isValid: boolean;
  score: number; // 0-100 confidence score
  reason?: string;
  suggestions?: string[];
}> => {
  // Remove whitespace
  const cleanEmail = email.trim().toLowerCase();
  
  // Check basic format
  if (!isValidEmailFormat(cleanEmail)) {
    return {
      isValid: false,
      score: 0,
      reason: 'Invalid email format',
      suggestions: ['Check for typos in the email address']
    };
  }
  
  const [localPart, domain] = cleanEmail.split('@');
  
  // Validate local part (before @)
  if (localPart.length === 0 || localPart.length > 64) {
    return {
      isValid: false,
      score: 30,
      reason: 'Invalid local part length',
      suggestions: ['Email local part must be between 1 and 64 characters']
    };
  }
  
  // Validate domain (after @)
  if (domain.length === 0 || domain.length > 255) {
    return {
      isValid: false,
      score: 40,
      reason: 'Invalid domain length',
      suggestions: ['Email domain must be between 1 and 255 characters']
    };
  }
  
  // Check for common typos in domains
  const commonTypos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outllook.com': 'outlook.com',
    'outlok.com': 'outlook.com',
    'gmai.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yaoo.com': 'yahoo.com',
  };
  
  if (commonTypos[domain]) {
    return {
      isValid: false,
      score: 20,
      reason: 'Possible typo detected',
      suggestions: [`Did you mean ${commonTypos[domain]}?`]
    };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /^[0-9]+$/, // Only numbers
    /^.*[0-9]{10,}.*$/, // Too many consecutive numbers
    /test|temp|fake|invalid/i, // Common test patterns
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(localPart) || pattern.test(domain)) {
      return {
        isValid: false,
        score: 50,
        reason: 'Email appears to be test or temporary',
        suggestions: ['Please provide a valid business or personal email']
      };
    }
  }
  
  // High confidence that format is valid (domain existence not verified)
  return {
    isValid: true,
    score: 85,
    reason: 'Email format is valid'
  };
};

/**
 * Verify email using external API (optional - requires API key)
 * @param email Email address to verify
 * @param apiKey Optional API key for third-party verification service
 * @param provider Service provider to use: 'abstract' | 'emailverifier' | 'emailable'
 * @returns Promise with verification result
 */
export const verifyEmailWithAPI = async (
  email: string,
  apiKey?: string,
  provider: 'abstract' | 'cloudmersive' | 'emailverifier' | 'emailable' = 'abstract'
): Promise<{
  isValid: boolean;
  score: number;
  reason?: string;
  provider?: string;
  details?: any;
}> => {
  // If no API key, just use basic validation
  if (!apiKey) {
    return validateEmail(email);
  }
  
  try {
    let response: Response;
    
    switch (provider) {
      case 'abstract': {
        // Abstract API - Free tier: 100 requests/month
        response = await fetch(
          `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`
        );
        
        if (!response.ok) {
          console.warn('Abstract API failed, using basic validation');
          return validateEmail(email);
        }
        
        const data = await response.json();
        
        const isValid = data.is_valid_format?.value === true && 
                        data.is_mx_found?.value === true &&
                        data.is_smtp_valid?.value === true;
        
        let score = 50;
        if (data.quality_score) {
          score = parseFloat(data.quality_score);
        } else if (isValid) {
          score = 90;
        }
        
        return {
          isValid,
          score,
          reason: data.is_valid_format?.value === false ? 'Invalid format' :
                  data.is_mx_found?.value === false ? 'Domain does not accept email' :
                  data.is_smtp_valid?.value === false ? 'SMTP validation failed' :
                  'Email verified',
          provider: 'Abstract API',
          details: {
            disposable: data.is_disposable_email?.value === true,
            deliverability: data.deliverability,
            autocorrect: data.autocorrect
          }
        };
      }
      
      case 'cloudmersive': {
        // Cloudmersive API - Free tier: 800/month, very accurate
        response = await fetch(
          'https://api.cloudmersive.com/validate/email/address/full',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Apikey': apiKey!
            },
            body: JSON.stringify({ email })
          }
        );
        
        if (!response.ok) {
          console.warn('Cloudmersive API failed, using basic validation');
          return validateEmail(email);
        }
        
        const data = await response.json();
        
        const isValid = data.IsValid === true;
        const score = data.IsValid ? 92 : 20;
        
        return {
          isValid,
          score,
          reason: data.IsValid ? 'Email verified by Cloudmersive' : 
                  data.IsDisposable ? 'Disposable email address' :
                  data.IsRoleAddress ? 'Role-based email address (info@, support@)' :
                  !data.CanConnectSMTP ? 'Cannot connect to SMTP server' :
                  'Email verification failed',
          provider: 'Cloudmersive',
          details: {
            disposable: data.IsDisposable,
            role: data.IsRoleAddress,
            smtp: data.CanConnectSMTP,
            catchAll: data.IsCatchallDomain
          }
        };
      }
      
      case 'emailverifier': {
        // Email Verifier API - Paid service with 98% accuracy
        response = await fetch(
          `https://emailverifierapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`
        );
        
        if (!response.ok) {
          console.warn('Email Verifier API failed, using basic validation');
          return validateEmail(email);
        }
        
        const data = await response.json();
        
        return {
          isValid: data.status === 'success' && data.deliverable === true,
          score: data.deliverable ? 95 : 30,
          reason: data.reason || 'Unknown status',
          provider: 'Email Verifier API',
          details: data
        };
      }
      
      case 'emailable': {
        // Emailable API - Real-time verification
        response = await fetch(
          `https://api.emailable.com/v1/verify?email=${encodeURIComponent(email)}&api_key=${apiKey}`
        );
        
        if (!response.ok) {
          console.warn('Emailable API failed, using basic validation');
          return validateEmail(email);
        }
        
        const data = await response.json();
        
        const isValid = data.state === 'deliverable';
        
        return {
          isValid,
          score: isValid ? 95 : 30,
          reason: data.reason || data.state,
          provider: 'Emailable',
          details: {
            score: data.score,
            disposable: data.disposable,
            role: data.role
          }
        };
      }
      
      default:
        return validateEmail(email);
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    // Fallback to basic validation on error
    return validateEmail(email);
  }
};

/**
 * Bulk validate emails
 * @param emails Array of email addresses to validate
 * @returns Array of validation results
 */
export const bulkValidateEmails = async (
  emails: string[]
): Promise<Array<{
  email: string;
  isValid: boolean;
  score: number;
  reason?: string;
}>> => {
  const results = await Promise.all(
    emails.map(async (email) => {
      const validation = await validateEmail(email);
      return {
        email,
        ...validation
      };
    })
  );
  
  return results;
};

/**
 * Get email validation statistics
 * @param emails Array of email addresses
 * @returns Statistics about email validity
 */
export const getEmailValidationStats = async (emails: string[]) => {
  const results = await bulkValidateEmails(emails);
  
  const validCount = results.filter(r => r.isValid).length;
  const invalidCount = results.length - validCount;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  
  const invalidEmails = results.filter(r => !r.isValid);
  
  return {
    total: emails.length,
    valid: validCount,
    invalid: invalidCount,
    validityRate: (validCount / emails.length * 100).toFixed(1) + '%',
    averageScore: averageScore.toFixed(1),
    invalidEmails: invalidEmails.map(r => ({
      email: r.email,
      reason: r.reason
    }))
  };
};

/**
 * Validate email before saving contact
 * This is the main function to use when creating/updating contacts
 */
export const validateContactEmail = async (
  email: string,
  options?: {
    showToast?: boolean;
    allowInvalid?: boolean;
    useAPI?: boolean;
    apiKey?: string;
    provider?: 'abstract' | 'cloudmersive' | 'emailverifier' | 'emailable';
  }
): Promise<{
  shouldProceed: boolean;
  validation: {
    isValid: boolean;
    score: number;
    reason?: string;
    provider?: string;
    details?: any;
  };
}> => {
  // Start with basic validation
  let validation = await validateEmail(email);
  
  // Auto-detect API keys from environment variables if not provided
  const cloudmersiveKey = import.meta.env.VITE_CLOUDMERSIVE_API_KEY;
  const abstractKey = import.meta.env.VITE_ABSTRACT_API_KEY;
  
  // If API verification is enabled, try to use it
  if (options?.useAPI !== false) {
    let apiKey = options?.apiKey;
    let provider = options?.provider || 'cloudmersive';
    
    // Auto-select best available API
    if (!apiKey) {
      if (cloudmersiveKey) {
        apiKey = cloudmersiveKey;
        provider = 'cloudmersive';
      } else if (abstractKey) {
        apiKey = abstractKey;
        provider = 'abstract';
      }
    }
    
    // Use API if we have a key
    if (apiKey) {
      try {
        const apiValidation = await verifyEmailWithAPI(
          email,
          apiKey,
          provider
        );
        
        // Use API result if it's more accurate
        if (apiValidation.score > validation.score) {
          validation = apiValidation;
        }
      } catch (error) {
        console.error('API verification failed, using basic validation:', error);
        // Continue with basic validation if API fails
      }
    }
  }
  
  if (!validation.isValid && !options?.allowInvalid) {
    if (options?.showToast) {
      const { toast } = await import('react-toastify');
      toast.warning(
        `Email validation failed: ${validation.reason}. ${validation.suggestions?.[0] || ''}`,
        {
          autoClose: 5000
        }
      );
    }
  } else if (validation.isValid && options?.showToast && validation.score > 80) {
    // Show success message for high-quality emails
    const { toast } = await import('react-toastify');
    toast.success(
      `Email verified: ${validation.reason}`,
      {
        autoClose: 3000
      }
    );
  }
  
  return {
    shouldProceed: validation.isValid || options?.allowInvalid || false,
    validation
  };
};

