import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Email Template Cloud Functions
export const getEmailTemplates = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Filter templates by the current user
    const snapshot = await admin.firestore()
      .collection('emailTemplates')
      .where('createdBy', '==', context.auth.uid)
      .get();
    let templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // If no templates exist for this user, seed default ones
    if (templates.length === 0) {
      const now = admin.firestore.FieldValue.serverTimestamp();
      const defaultTemplates = [
        // Welcome & Onboarding Templates
        {
          name: 'Welcome Email',
          subject: 'Welcome to {{company_name}}!',
          body: '<h2>Welcome {{first_name}}!</h2><p>Thank you for joining us at {{company_name}}. We are excited to have you on board.</p><p>Here\'s what you can expect:</p><ul><li>Personalized service tailored to your needs</li><li>Regular updates and insights</li><li>24/7 customer support</li></ul><p>If you have any questions, feel free to reach out to us.</p><p>Best regards,<br>{{sender_name}}</p>',
          category: 'welcome',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        {
          name: 'Onboarding Series - Getting Started',
          subject: 'Getting Started with {{company_name}}',
          body: '<h2>Welcome Aboard, {{first_name}}!</h2><p>We\'re thrilled to have you join us! This email will help you get started.</p><h3>Next Steps:</h3><ul><li>Complete your profile setup</li><li>Explore our resources and tutorials</li><li>Connect with our team for support</li></ul><p>If you have any questions, we\'re here to help!</p><p>Best regards,<br>The {{company_name}} Team</p>',
          category: 'onboarding',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        
        // Follow-up & Relationship Templates
        {
          name: 'Follow-up Email',
          subject: 'Following up on our conversation',
          body: '<h2>Following Up</h2><p>Hi {{first_name}},</p><p>I wanted to follow up on our conversation about your interest in our services.</p><p>Let me know if you have any questions or if you\'d like to schedule a call to discuss further.</p><p>Best regards,<br>{{sender_name}}</p>',
          category: 'follow-up',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        {
          name: 'Check-in Email',
          subject: 'Checking in with {{first_name}}',
          body: '<h2>How Are Things Going?</h2><p>Hi {{first_name}},</p><p>I wanted to check in and see how everything is going with {{company_name}}.</p><p>Is there anything we can help you with or improve?</p><p>Your feedback is valuable to us!</p><p>Best regards,<br>{{sender_name}}</p>',
          category: 'follow-up',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        {
          name: 'Thank You Email',
          subject: 'Thank You, {{first_name}}!',
          body: '<h2>Thank You!</h2><p>Hi {{first_name}},</p><p>Thank you for your interest in our services and for taking the time to connect with us.</p><p>We truly appreciate your business and look forward to serving you.</p><p>If there\'s anything we can help you with, please don\'t hesitate to reach out.</p><p>Best regards,<br>{{sender_name}}</p>',
          category: 'thank-you',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        
        // Promotional & Sales Templates
        {
          name: 'Promotional Email',
          subject: 'Special Offer for {{first_name}}!',
          body: '<h2>Special Offer Just for You!</h2><p>Hi {{first_name}},</p><p>We have an exclusive offer for {{company_name}}:</p><div style="background-color: #f0f8ff; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3>🎉 Limited Time Offer</h3><p>Get 20% off your next purchase!</p><p><strong>Use code: SAVE20</strong></p></div><p>This offer expires soon, so don\'t wait!</p><p>Best regards,<br>The Team</p>',
          category: 'promotional',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        {
          name: 'Flash Sale Announcement',
          subject: '🔥 Flash Sale - Today Only!',
          body: '<h2>Flash Sale - Limited Time!</h2><p>Hi {{first_name}},</p><p>Don\'t miss out on our flash sale happening TODAY only!</p><div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #ffc107;"><h3>⚡ Exclusive Deal for {{company_name}}</h3><p><strong>50% OFF</strong> on selected items</p><p>Use code: FLASH50</p><p>Sale ends today at midnight!</p></div><p>Shop now and save big!</p><p>Best regards,<br>The Team</p>',
          category: 'promotional',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        {
          name: 'Product Launch Email',
          subject: 'Introducing Our New Product for {{company_name}}',
          body: '<h2>Exciting News: New Product Launch!</h2><p>Hi {{first_name}},</p><p>We\'re excited to announce the launch of our newest product designed specifically for companies like {{company_name}}.</p><div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3>✨ What\'s New:</h3><ul><li>Enhanced features for better productivity</li><li>Improved user experience</li><li>New automation capabilities</li></ul></div><p>Get early access today!</p><p>Best regards,<br>The Team</p>',
          category: 'announcement',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        
        // Newsletter & Content Templates
        {
          name: 'Newsletter',
          subject: 'Monthly Newsletter - {{company_name}}',
          body: '<h2>Monthly Newsletter</h2><p>Dear {{first_name}},</p><p>Here\'s what\'s happening this month:</p><h3>Latest Updates</h3><p>We\'ve been working hard to bring you the best experience possible.</p><h3>Featured Content</h3><p>Don\'t miss out on our latest insights and tips.</p><p>Thank you for being a valued member of our community!</p><p>Best regards,<br>The {{company_name}} Team</p>',
          category: 'newsletter',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        {
          name: 'Weekly Digest',
          subject: 'Your Weekly Digest - {{company_name}}',
          body: '<h2>Your Weekly Summary</h2><p>Hi {{first_name}},</p><p>Here\'s what you might have missed this week:</p><h3>📊 Key Highlights</h3><ul><li>Industry news and trends</li><li>Tips and best practices</li><li>Upcoming events and webinars</li></ul><p>Stay informed and ahead of the curve!</p><p>Best regards,<br>The Team</p>',
          category: 'newsletter',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        
        // Event & Meeting Templates
        {
          name: 'Event Invitation',
          subject: 'You\'re Invited: Exclusive Event for {{company_name}}',
          body: '<h2>You\'re Invited!</h2><p>Hi {{first_name}},</p><p>We\'re hosting an exclusive event and would love to have {{company_name}} join us!</p><div style="background-color: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3>📅 Event Details</h3><p><strong>Date:</strong> [Event Date]</p><p><strong>Time:</strong> [Event Time]</p><p><strong>Location:</strong> [Event Location/Virtual]</p></div><p>This is a great opportunity to network, learn, and connect with industry leaders.</p><p>RSVP to secure your spot!</p><p>Best regards,<br>The Team</p>',
          category: 'event',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        {
          name: 'Meeting Request',
          subject: 'Meeting Request - {{first_name}}',
          body: '<h2>Let\'s Schedule a Meeting</h2><p>Hi {{first_name}},</p><p>I\'d love to schedule a time to discuss how we can help {{company_name}} achieve your goals.</p><p>Please let me know your availability, and I\'ll send over a calendar invite.</p><p>Looking forward to speaking with you!</p><p>Best regards,<br>{{sender_name}}</p>',
          category: 'meeting',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        
        // Re-engagement Templates
        {
          name: 'Re-engagement Email',
          subject: 'We Miss You, {{first_name}}!',
          body: '<h2>We Haven\'t Heard From You Lately</h2><p>Hi {{first_name}},</p><p>We noticed it\'s been a while since we last connected. We\'d love to catch up and see how we can help you achieve your goals.</p><p>Here\'s what\'s new:</p><ul><li>Updated features and improvements</li><li>New resources and tools</li><li>Special offers for returning customers</li></ul><p>Let\'s reconnect and explore how we can support your success!</p><p>Best regards,<br>The {{company_name}} Team</p>',
          category: 're-engagement',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        
        // Survey & Feedback Templates
        {
          name: 'Survey Request',
          subject: 'Your Feedback Matters, {{first_name}}',
          body: '<h2>We\'d Love Your Feedback</h2><p>Hi {{first_name}},</p><p>Your opinion is incredibly valuable to us at {{company_name}}. We\'d appreciate it if you could take a few minutes to share your thoughts.</p><p>Your feedback helps us:</p><ul><li>Improve our products and services</li><li>Better understand your needs</li><li>Create a better experience for everyone</li></ul><p>Thank you for your time and continued support!</p><p>Best regards,<br>The Team</p>',
          category: 'survey',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        
        // Special Occasions Templates
        {
          name: 'Birthday Greeting',
          subject: 'Happy Birthday, {{first_name}}!',
          body: '<h2>🎉 Happy Birthday!</h2><p>Hi {{first_name}},</p><p>We wanted to take a moment to wish you a very happy birthday!</p><p>To celebrate, we have a special birthday offer just for you:</p><div style="background-color: #ffebee; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3>🎁 Your Birthday Gift</h3><p>Enjoy a special birthday discount on us!</p><p><strong>Use code: BIRTHDAY2024</strong></p></div><p>We hope you have a wonderful day filled with joy and celebration!</p><p>Best wishes,<br>The {{company_name}} Team</p>',
          category: 'special',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        {
          name: 'Holiday Greeting',
          subject: 'Happy Holidays from {{company_name}}!',
          body: '<h2>🎄 Happy Holidays!</h2><p>Hi {{first_name}},</p><p>As we approach the holiday season, we wanted to take a moment to thank you for being a valued member of the {{company_name}} community.</p><p>We appreciate your continued support and look forward to serving you in the coming year.</p><p>Wishing you and your team a wonderful holiday season!</p><p>Best regards,<br>The {{company_name}} Team</p>',
          category: 'special',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        
        // Support & Customer Service Templates
        {
          name: 'Support Follow-up',
          subject: 'How Was Your Support Experience?',
          body: '<h2>How Can We Help Further?</h2><p>Hi {{first_name}},</p><p>We wanted to follow up on your recent support request and see if everything is working well for you now.</p><p>If you need any additional assistance, please don\'t hesitate to reach out.</p><p>Your satisfaction is our priority!</p><p>Best regards,<br>The Support Team</p>',
          category: 'support',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        {
          name: 'Feature Announcement',
          subject: 'New Feature: Better Tools for {{company_name}}',
          body: '<h2>Exciting Product Update!</h2><p>Hi {{first_name}},</p><p>We\'re excited to share some amazing new features that we\'ve been working on:</p><div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0;"><h3>✨ What\'s New:</h3><ul><li>Enhanced user experience</li><li>New automation tools</li><li>Improved analytics dashboard</li></ul></div><p>These updates are designed to help {{company_name}} achieve even better results.</p><p>Best regards,<br>The Team</p>',
          category: 'announcement',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        
        // Transactional Templates
        {
          name: 'Order Confirmation',
          subject: 'Order Confirmation - Thank You {{first_name}}!',
          body: '<h2>Thank You for Your Order!</h2><p>Hi {{first_name}},</p><p>Thank you for your order. We\'ve received it and are processing it now.</p><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;"><h3>Order Details:</h3><p><strong>Order Number:</strong> [ORDER_NUMBER]</p><p><strong>Date:</strong> [ORDER_DATE]</p></div><p>You\'ll receive a shipping confirmation email once your order ships.</p><p>Best regards,<br>The {{company_name}} Team</p>',
          category: 'transactional',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        },
        {
          name: 'Abandoned Cart Reminder',
          subject: 'You left something behind, {{first_name}}',
          body: '<h2>Don\'t Miss Out!</h2><p>Hi {{first_name}},</p><p>We noticed you started exploring our offerings but didn\'t complete your selection.</p><p>Here\'s what you were looking at:</p><div style="background-color: #f3e5f5; padding: 15px; border-radius: 5px; margin: 15px 0;"><p><strong>Your Selection:</strong></p><p>Complete your purchase now and take advantage of our current offers!</p></div><p>Have questions? We\'re here to help!</p><p>Best regards,<br>The {{company_name}} Team</p>',
          category: 'transactional',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: context.auth.uid
        }
      ];
      
      // Create default templates
      const batch = admin.firestore().batch();
      defaultTemplates.forEach(template => {
        const ref = admin.firestore().collection('emailTemplates').doc();
        batch.set(ref, template);
      });
      await batch.commit();
      
      // Re-fetch templates after seeding (filtered by user)
      const updatedSnapshot = await admin.firestore()
        .collection('emailTemplates')
        .where('createdBy', '==', context.auth.uid)
        .get();
      templates = updatedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    return { success: true, templates };
  } catch (error: any) {
    console.error('Error fetching email templates:', error);
    throw new functions.https.HttpsError('internal', `Failed to fetch templates: ${error.message}`);
  }
});

// Force seed templates function
export const seedEmailTemplates = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Delete existing templates for this user first (optional - can be removed if you want to keep existing)
    const existingSnapshot = await admin.firestore()
      .collection('emailTemplates')
      .where('createdBy', '==', context.auth.uid)
      .get();
    
    if (existingSnapshot.docs.length > 0) {
      // Optionally delete existing ones, or just skip
      const deleteBatch = admin.firestore().batch();
      existingSnapshot.docs.forEach(doc => deleteBatch.delete(doc.ref));
      await deleteBatch.commit();
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const defaultTemplates = [
      // Welcome & Onboarding Templates
      {
        name: 'Welcome Email',
        subject: 'Welcome to {{company_name}}!',
        body: '<h2>Welcome {{first_name}}!</h2><p>Thank you for joining us at {{company_name}}. We are excited to have you on board.</p><p>Here\'s what you can expect:</p><ul><li>Personalized service tailored to your needs</li><li>Regular updates and insights</li><li>24/7 customer support</li></ul><p>If you have any questions, feel free to reach out to us.</p><p>Best regards,<br>{{sender_name}}</p>',
        category: 'welcome',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      {
        name: 'Onboarding Series - Getting Started',
        subject: 'Getting Started with {{company_name}}',
        body: '<h2>Welcome Aboard, {{first_name}}!</h2><p>We\'re thrilled to have you join us! This email will help you get started.</p><h3>Next Steps:</h3><ul><li>Complete your profile setup</li><li>Explore our resources and tutorials</li><li>Connect with our team for support</li></ul><p>If you have any questions, we\'re here to help!</p><p>Best regards,<br>The {{company_name}} Team</p>',
        category: 'onboarding',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      
      // Follow-up & Relationship Templates
      {
        name: 'Follow-up Email',
        subject: 'Following up on our conversation',
        body: '<h2>Following Up</h2><p>Hi {{first_name}},</p><p>I wanted to follow up on our conversation about your interest in our services.</p><p>Let me know if you have any questions or if you\'d like to schedule a call to discuss further.</p><p>Best regards,<br>{{sender_name}}</p>',
        category: 'follow-up',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      {
        name: 'Check-in Email',
        subject: 'Checking in with {{first_name}}',
        body: '<h2>How Are Things Going?</h2><p>Hi {{first_name}},</p><p>I wanted to check in and see how everything is going with {{company_name}}.</p><p>Is there anything we can help you with or improve?</p><p>Your feedback is valuable to us!</p><p>Best regards,<br>{{sender_name}}</p>',
        category: 'follow-up',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      {
        name: 'Thank You Email',
        subject: 'Thank You, {{first_name}}!',
        body: '<h2>Thank You!</h2><p>Hi {{first_name}},</p><p>Thank you for your interest in our services and for taking the time to connect with us.</p><p>We truly appreciate your business and look forward to serving you.</p><p>If there\'s anything we can help you with, please don\'t hesitate to reach out.</p><p>Best regards,<br>{{sender_name}}</p>',
        category: 'thank-you',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      
      // Promotional & Sales Templates
      {
        name: 'Promotional Email',
        subject: 'Special Offer for {{first_name}}!',
        body: '<h2>Special Offer Just for You!</h2><p>Hi {{first_name}},</p><p>We have an exclusive offer for {{company_name}}:</p><div style="background-color: #f0f8ff; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3>🎉 Limited Time Offer</h3><p>Get 20% off your next purchase!</p><p><strong>Use code: SAVE20</strong></p></div><p>This offer expires soon, so don\'t wait!</p><p>Best regards,<br>The Team</p>',
        category: 'promotional',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      {
        name: 'Flash Sale Announcement',
        subject: '🔥 Flash Sale - Today Only!',
        body: '<h2>Flash Sale - Limited Time!</h2><p>Hi {{first_name}},</p><p>Don\'t miss out on our flash sale happening TODAY only!</p><div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #ffc107;"><h3>⚡ Exclusive Deal for {{company_name}}</h3><p><strong>50% OFF</strong> on selected items</p><p>Use code: FLASH50</p><p>Sale ends today at midnight!</p></div><p>Shop now and save big!</p><p>Best regards,<br>The Team</p>',
        category: 'promotional',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      {
        name: 'Product Launch Email',
        subject: 'Introducing Our New Product for {{company_name}}',
        body: '<h2>Exciting News: New Product Launch!</h2><p>Hi {{first_name}},</p><p>We\'re excited to announce the launch of our newest product designed specifically for companies like {{company_name}}.</p><div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3>✨ What\'s New:</h3><ul><li>Enhanced features for better productivity</li><li>Improved user experience</li><li>New automation capabilities</li></ul></div><p>Get early access today!</p><p>Best regards,<br>The Team</p>',
        category: 'announcement',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      
      // Newsletter & Content Templates
      {
        name: 'Newsletter',
        subject: 'Monthly Newsletter - {{company_name}}',
        body: '<h2>Monthly Newsletter</h2><p>Dear {{first_name}},</p><p>Here\'s what\'s happening this month:</p><h3>Latest Updates</h3><p>We\'ve been working hard to bring you the best experience possible.</p><h3>Featured Content</h3><p>Don\'t miss out on our latest insights and tips.</p><p>Thank you for being a valued member of our community!</p><p>Best regards,<br>The {{company_name}} Team</p>',
        category: 'newsletter',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      {
        name: 'Weekly Digest',
        subject: 'Your Weekly Digest - {{company_name}}',
        body: '<h2>Your Weekly Summary</h2><p>Hi {{first_name}},</p><p>Here\'s what you might have missed this week:</p><h3>📊 Key Highlights</h3><ul><li>Industry news and trends</li><li>Tips and best practices</li><li>Upcoming events and webinars</li></ul><p>Stay informed and ahead of the curve!</p><p>Best regards,<br>The Team</p>',
        category: 'newsletter',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      
      // Event & Meeting Templates
      {
        name: 'Event Invitation',
        subject: 'You\'re Invited: Exclusive Event for {{company_name}}',
        body: '<h2>You\'re Invited!</h2><p>Hi {{first_name}},</p><p>We\'re hosting an exclusive event and would love to have {{company_name}} join us!</p><div style="background-color: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3>📅 Event Details</h3><p><strong>Date:</strong> [Event Date]</p><p><strong>Time:</strong> [Event Time]</p><p><strong>Location:</strong> [Event Location/Virtual]</p></div><p>This is a great opportunity to network, learn, and connect with industry leaders.</p><p>RSVP to secure your spot!</p><p>Best regards,<br>The Team</p>',
        category: 'event',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      {
        name: 'Meeting Request',
        subject: 'Meeting Request - {{first_name}}',
        body: '<h2>Let\'s Schedule a Meeting</h2><p>Hi {{first_name}},</p><p>I\'d love to schedule a time to discuss how we can help {{company_name}} achieve your goals.</p><p>Please let me know your availability, and I\'ll send over a calendar invite.</p><p>Looking forward to speaking with you!</p><p>Best regards,<br>{{sender_name}}</p>',
        category: 'meeting',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      
      // Re-engagement Templates
      {
        name: 'Re-engagement Email',
        subject: 'We Miss You, {{first_name}}!',
        body: '<h2>We Haven\'t Heard From You Lately</h2><p>Hi {{first_name}},</p><p>We noticed it\'s been a while since we last connected. We\'d love to catch up and see how we can help you achieve your goals.</p><p>Here\'s what\'s new:</p><ul><li>Updated features and improvements</li><li>New resources and tools</li><li>Special offers for returning customers</li></ul><p>Let\'s reconnect and explore how we can support your success!</p><p>Best regards,<br>The {{company_name}} Team</p>',
        category: 're-engagement',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      
      // Survey & Feedback Templates
      {
        name: 'Survey Request',
        subject: 'Your Feedback Matters, {{first_name}}',
        body: '<h2>We\'d Love Your Feedback</h2><p>Hi {{first_name}},</p><p>Your opinion is incredibly valuable to us at {{company_name}}. We\'d appreciate it if you could take a few minutes to share your thoughts.</p><p>Your feedback helps us:</p><ul><li>Improve our products and services</li><li>Better understand your needs</li><li>Create a better experience for everyone</li></ul><p>Thank you for your time and continued support!</p><p>Best regards,<br>The Team</p>',
        category: 'survey',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      
      // Special Occasions Templates
      {
        name: 'Birthday Greeting',
        subject: 'Happy Birthday, {{first_name}}!',
        body: '<h2>🎉 Happy Birthday!</h2><p>Hi {{first_name}},</p><p>We wanted to take a moment to wish you a very happy birthday!</p><p>To celebrate, we have a special birthday offer just for you:</p><div style="background-color: #ffebee; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3>🎁 Your Birthday Gift</h3><p>Enjoy a special birthday discount on us!</p><p><strong>Use code: BIRTHDAY2024</strong></p></div><p>We hope you have a wonderful day filled with joy and celebration!</p><p>Best wishes,<br>The {{company_name}} Team</p>',
        category: 'special',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      {
        name: 'Holiday Greeting',
        subject: 'Happy Holidays from {{company_name}}!',
        body: '<h2>🎄 Happy Holidays!</h2><p>Hi {{first_name}},</p><p>As we approach the holiday season, we wanted to take a moment to thank you for being a valued member of the {{company_name}} community.</p><p>We appreciate your continued support and look forward to serving you in the coming year.</p><p>Wishing you and your team a wonderful holiday season!</p><p>Best regards,<br>The {{company_name}} Team</p>',
        category: 'special',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      
      // Support & Customer Service Templates
      {
        name: 'Support Follow-up',
        subject: 'How Was Your Support Experience?',
        body: '<h2>How Can We Help Further?</h2><p>Hi {{first_name}},</p><p>We wanted to follow up on your recent support request and see if everything is working well for you now.</p><p>If you need any additional assistance, please don\'t hesitate to reach out.</p><p>Your satisfaction is our priority!</p><p>Best regards,<br>The Support Team</p>',
        category: 'support',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      {
        name: 'Feature Announcement',
        subject: 'New Feature: Better Tools for {{company_name}}',
        body: '<h2>Exciting Product Update!</h2><p>Hi {{first_name}},</p><p>We\'re excited to share some amazing new features that we\'ve been working on:</p><div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0;"><h3>✨ What\'s New:</h3><ul><li>Enhanced user experience</li><li>New automation tools</li><li>Improved analytics dashboard</li></ul></div><p>These updates are designed to help {{company_name}} achieve even better results.</p><p>Best regards,<br>The Team</p>',
        category: 'announcement',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      
      // Transactional Templates
      {
        name: 'Order Confirmation',
        subject: 'Order Confirmation - Thank You {{first_name}}!',
        body: '<h2>Thank You for Your Order!</h2><p>Hi {{first_name}},</p><p>Thank you for your order. We\'ve received it and are processing it now.</p><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;"><h3>Order Details:</h3><p><strong>Order Number:</strong> [ORDER_NUMBER]</p><p><strong>Date:</strong> [ORDER_DATE]</p></div><p>You\'ll receive a shipping confirmation email once your order ships.</p><p>Best regards,<br>The {{company_name}} Team</p>',
        category: 'transactional',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      },
      {
        name: 'Abandoned Cart Reminder',
        subject: 'You left something behind, {{first_name}}',
        body: '<h2>Don\'t Miss Out!</h2><p>Hi {{first_name}},</p><p>We noticed you started exploring our offerings but didn\'t complete your selection.</p><p>Here\'s what you were looking at:</p><div style="background-color: #f3e5f5; padding: 15px; border-radius: 5px; margin: 15px 0;"><p><strong>Your Selection:</strong></p><p>Complete your purchase now and take advantage of our current offers!</p></div><p>Have questions? We\'re here to help!</p><p>Best regards,<br>The {{company_name}} Team</p>',
        category: 'transactional',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid
      }
    ];
    
    // Create default templates
    const batch = admin.firestore().batch();
    defaultTemplates.forEach(template => {
      const ref = admin.firestore().collection('emailTemplates').doc();
      batch.set(ref, template);
    });
    await batch.commit();
    
    // Return created templates
    const updatedSnapshot = await admin.firestore()
      .collection('emailTemplates')
      .where('createdBy', '==', context.auth.uid)
      .get();
    const templates = updatedSnapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
    
    return { success: true, count: templates.length, templates };
  } catch (error: any) {
    console.error('Error seeding templates:', error);
    throw new functions.https.HttpsError('internal', `Failed to seed templates: ${error.message}`);
  }
});

export const createEmailTemplate = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { name, subject, body, category, isActive = true } = data;
  if (!name || !subject || !body) {
    throw new functions.https.HttpsError('invalid-argument', 'name, subject, and body are required');
  }

  try {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const templateRef = await admin.firestore().collection('emailTemplates').add({
      name,
      subject,
      body,
      category: category || 'general',
      isActive,
      createdAt: now,
      updatedAt: now,
      createdBy: context.auth.uid
    });

    return { success: true, id: templateRef.id };
  } catch (error: any) {
    console.error('Error creating email template:', error);
    throw new functions.https.HttpsError('internal', `Failed to create template: ${error.message}`);
  }
});

export const updateEmailTemplate = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { id, name, subject, body, category, isActive } = data;
  if (!id) {
    throw new functions.https.HttpsError('invalid-argument', 'template id is required');
  }

  try {
    const templateRef = admin.firestore().collection('emailTemplates').doc(id);
    const templateDoc = await templateRef.get();
    
    if (!templateDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Template not found');
    }

    // Check ownership - ensure user can only edit their own templates
    const templateData = templateDoc.data();
    if (templateData?.createdBy !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'You can only edit templates you created');
    }

    const updateData: any = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (name !== undefined) updateData.name = name;
    if (subject !== undefined) updateData.subject = subject;
    if (body !== undefined) updateData.body = body;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;

    await templateRef.update(updateData);

    return { success: true };
  } catch (error: any) {
    console.error('Error updating email template:', error);
    throw new functions.https.HttpsError('internal', `Failed to update template: ${error.message}`);
  }
});

export const deleteEmailTemplate = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { id } = data;
  if (!id) {
    throw new functions.https.HttpsError('invalid-argument', 'template id is required');
  }

  try {
    const templateRef = admin.firestore().collection('emailTemplates').doc(id);
    const templateDoc = await templateRef.get();
    
    if (!templateDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Template not found');
    }

    // Check ownership - ensure user can only delete their own templates
    const templateData = templateDoc.data();
    if (templateData?.createdBy !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'You can only delete templates you created');
    }

    await templateRef.delete();
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting email template:', error);
    throw new functions.https.HttpsError('internal', `Failed to delete template: ${error.message}`);
  }
});

// Campaign Email Sending Function
export const sendCampaignEmail = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { to, subject, html, from, fromName } = data;
  if (!to || !subject || !html) {
    throw new functions.https.HttpsError('invalid-argument', 'to, subject, and html are required');
  }

  try {
    // For now, just log the email (actual sending would be implemented with SendGrid/AWS SES/SMTP)
    console.log('Email to send:', { to, subject, from, fromName });
    
    // In production, you would integrate with an email service here
    // const emailService = new EmailService();
    // await emailService.sendEmail({ to, subject, html, from, fromName });
    
    return { success: true, messageId: `email_${Date.now()}` };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', `Failed to send email: ${error.message}`);
  }
});

// AI Functions (placeholder implementations)
export const generateContent = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { prompt, type } = data;
  
  try {
    // Placeholder - would integrate with actual AI service
    return {
      success: true,
      content: `Generated ${type} content based on: ${prompt}`
    };
  } catch (error: any) {
    console.error('Error generating content:', error);
    throw new functions.https.HttpsError('internal', `Failed to generate content: ${error.message}`);
  }
});

export const analyzeLead = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { contactData } = data;
  
  try {
    // Placeholder - would integrate with actual AI service
    // TODO: Use contactData for AI analysis
    return {
      success: true,
      score: 75,
      reasoning: `Based on contact data analysis (${contactData ? 'data provided' : 'no data'})`
    };
  } catch (error: any) {
    console.error('Error analyzing lead:', error);
    throw new functions.https.HttpsError('internal', `Failed to analyze lead: ${error.message}`);
  }
});

export const summarizeCall = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { transcript } = data;
  
  try {
    // Placeholder - would integrate with actual AI service
    // TODO: Use transcript for AI summarization
    return {
      success: true,
      summary: `Call summary based on transcript (${transcript ? transcript.length + ' characters' : 'no transcript provided'})`,
      actionItems: []
    };
  } catch (error: any) {
    console.error('Error summarizing call:', error);
    throw new functions.https.HttpsError('internal', `Failed to summarize call: ${error.message}`);
  }
});

// SMS Campaign Function
export const sendCampaignSMS = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { to, message, from } = data;
  
  if (!to || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'to and message are required');
  }

  try {
    // Get Twilio credentials from Firebase Functions config
    const twilioConfig = functions.config().twilio;
    
    if (!twilioConfig || !twilioConfig.account_sid || !twilioConfig.auth_token) {
      throw new functions.https.HttpsError('failed-precondition', 'Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in Firebase Functions config.');
    }

    // Initialize Twilio client
    const twilio = require('twilio');
    const client = twilio(twilioConfig.account_sid, twilioConfig.auth_token);
    
    // Get the from phone number (use provided number or default from config)
    const fromNumber = from || twilioConfig.phone_number;
    
    if (!fromNumber) {
      throw new functions.https.HttpsError('failed-precondition', 'Twilio phone number is not configured. Please set TWILIO_PHONE_NUMBER in Firebase Functions config.');
    }

    // Send SMS
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });

    // Log SMS sending for tracking
    await admin.firestore().collection('smsLogs').add({
      to,
      from: fromNumber,
      message,
      messageId: result.sid,
      status: result.status,
      createdBy: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { 
      success: true, 
      messageId: result.sid,
      status: result.status,
      sid: result.sid
    };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    
    // Handle Twilio-specific errors
    if (error.code === 21211) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid phone number format. Please use E.164 format (e.g., +1234567890)');
    } else if (error.code === 21608) {
      throw new functions.https.HttpsError('failed-precondition', 'Phone number is not verified (trial account restriction). Please verify the number in Twilio Console.');
    } else if (error.code === 21614) {
      throw new functions.https.HttpsError('failed-precondition', 'This number is unverified. Trial accounts can only send to verified numbers.');
    }
    
    throw new functions.https.HttpsError('internal', `Failed to send SMS: ${error.message}`);
  }
});

// Lead Extraction Functions
// Extract lead from LinkedIn profile URL
export const extractLeadFromLinkedIn = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { linkedInUrl, provider } = data;
  
  if (!linkedInUrl) {
    throw new functions.https.HttpsError('invalid-argument', 'LinkedIn URL is required');
  }

  try {
    // Use hybrid approach: Try local database first, then API
    const hybridResult = await lookupContactHybridInternal(linkedInUrl, provider || 'lusha', context.auth.uid);
    
    if (hybridResult.success) {
      // Format to match expected return format
      const leadData = {
        firstName: hybridResult.firstName,
        lastName: hybridResult.lastName,
        email: hybridResult.email,
        phone: hybridResult.phone,
        company: hybridResult.company,
        jobTitle: hybridResult.jobTitle,
        linkedInUrl: hybridResult.linkedInUrl,
        source: hybridResult.source,
        provider: hybridResult.provider
      };

      // Log extraction for tracking
      await admin.firestore().collection('leadExtractions').add({
        linkedInUrl,
        provider: hybridResult.provider,
        leadData,
        createdBy: context.auth.uid,
        fromCache: hybridResult.provider === 'local',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        lead: leadData
      };
    }

    // If hybrid lookup fails, fall back to direct API call
    // Get API configuration from Firebase Functions config
    const providerConfig = functions.config()[provider?.toLowerCase() || 'lusha'];
    
    if (!providerConfig || !providerConfig.api_key) {
      throw new functions.https.HttpsError('failed-precondition', `${provider || 'Lusha'} API key is not configured. Please set the API key in Firebase Functions config.`);
    }

    let leadData: any = null;

    // Support multiple providers: Lusha, Apollo, Hunter.io
    const selectedProvider = (provider?.toLowerCase() || 'lusha') as string;

    if (selectedProvider === 'lusha') {
      // Lusha API integration
      const https = require('https');
      const linkedInId = extractLinkedInId(linkedInUrl);
      
      if (!linkedInId) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid LinkedIn URL format');
      }

      const response = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.lusha.com',
          path: `/person?linkedInUrl=${encodeURIComponent(linkedInUrl)}`,
          method: 'GET',
          headers: {
            'api-key': providerConfig.api_key,
            'Content-Type': 'application/json'
          }
        };

        const req = https.request(options, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode === 200 && parsed.person) {
                resolve(parsed.person);
              } else {
                reject(new Error(parsed.message || 'Failed to extract lead'));
              }
            } catch (e) {
              reject(e);
            }
          });
        });

        req.on('error', reject);
        req.end();
      });

      leadData = {
        firstName: (response as any).firstName,
        lastName: (response as any).lastName,
        email: (response as any).emails?.[0]?.address || null,
        phone: (response as any).phones?.[0]?.number || null,
        company: (response as any).company || null,
        jobTitle: (response as any).jobTitle || null,
        linkedInUrl: linkedInUrl,
        source: 'lusha_linkedin',
        provider: 'lusha'
      };

    } else if (selectedProvider === 'apollo') {
      // Apollo.io API integration
      const https = require('https');
      const linkedInId = extractLinkedInId(linkedInUrl);
      
      if (!linkedInId) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid LinkedIn URL format');
      }

      const response = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.apollo.io',
          path: `/v1/people/match`,
          method: 'POST',
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
          }
        };

        const postData = JSON.stringify({
          api_key: providerConfig.api_key,
          linkedin_url: linkedInUrl
        });

        const req = https.request(options, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode === 200 && parsed.person) {
                resolve(parsed.person);
              } else {
                reject(new Error(parsed.message || 'Failed to extract lead'));
              }
            } catch (e) {
              reject(e);
            }
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      leadData = {
        firstName: (response as any).first_name,
        lastName: (response as any).last_name,
        email: (response as any).email || null,
        phone: (response as any).phone_numbers?.[0]?.sanitized_number || null,
        company: (response as any).organization?.name || null,
        jobTitle: (response as any).title || null,
        linkedInUrl: linkedInUrl,
        source: 'apollo_linkedin',
        provider: 'apollo'
      };

    } else if (selectedProvider === 'hunter') {
      // Hunter.io API integration - primarily for email finding
      const https = require('https');
      const domain = extractDomainFromLinkedInUrl(linkedInUrl);
      
      if (!domain) {
        throw new functions.https.HttpsError('invalid-argument', 'Could not extract domain from LinkedIn URL');
      }

      // For Hunter.io, we'll use domain search
      const response = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.hunter.io',
          path: `/v2/domain-search?domain=${domain}&api_key=${providerConfig.api_key}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const req = https.request(options, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode === 200 && parsed.data) {
                resolve(parsed.data);
              } else {
                reject(new Error(parsed.errors?.[0]?.details || 'Failed to extract lead'));
              }
            } catch (e) {
              reject(e);
            }
          });
        });

        req.on('error', reject);
        req.end();
      });

      // Extract first person from results
      const person = (response as any).emails?.[0];
      leadData = {
        firstName: person?.first_name || null,
        lastName: person?.last_name || null,
        email: person?.value || null,
        company: (response as any).domain || null,
        jobTitle: person?.position || null,
        linkedInUrl: linkedInUrl,
        source: 'hunter_linkedin',
        provider: 'hunter'
      };
    } else {
      throw new functions.https.HttpsError('invalid-argument', `Unsupported provider: ${selectedProvider}`);
    }

    // Log extraction for tracking
    await admin.firestore().collection('leadExtractions').add({
      linkedInUrl,
      provider: selectedProvider,
      leadData,
      createdBy: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      lead: leadData
    };

  } catch (error: any) {
    console.error('Error extracting lead:', error);
    throw new functions.https.HttpsError('internal', `Failed to extract lead: ${error.message}`);
  }
});

// Bulk extract leads from LinkedIn search URL or list of URLs
export const bulkExtractLeads = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { linkedInUrls, provider } = data;
  
  if (!linkedInUrls || !Array.isArray(linkedInUrls) || linkedInUrls.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'LinkedIn URLs array is required');
  }

  try {
    const results = [];
    const errors = [];

    // Process URLs with rate limiting (max 10 concurrent)
    const batchSize = 5;
    for (let i = 0; i < linkedInUrls.length; i += batchSize) {
      const batch = linkedInUrls.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (url: string) => {
        try {
          // Call extractLeadFromLinkedIn logic inline
          const providerConfig = functions.config()[provider?.toLowerCase() || 'lusha'];
          
          if (!providerConfig || !providerConfig.api_key) {
            throw new Error(`${provider || 'Lusha'} API key is not configured`);
          }

          const https = require('https');
          const linkedInId = extractLinkedInId(url);
          
          if (!linkedInId) {
            throw new Error('Invalid LinkedIn URL format');
          }

          const response = await new Promise((resolve, reject) => {
            const options = {
              hostname: 'api.lusha.com',
              path: `/person?linkedInUrl=${encodeURIComponent(url)}`,
              method: 'GET',
              headers: {
                'api-key': providerConfig.api_key,
                'Content-Type': 'application/json'
              }
            };

            const req = https.request(options, (res: any) => {
              let data = '';
              res.on('data', (chunk: any) => { data += chunk; });
              res.on('end', () => {
                try {
                  const parsed = JSON.parse(data);
                  if (res.statusCode === 200 && parsed.person) {
                    resolve(parsed.person);
                  } else {
                    reject(new Error(parsed.message || 'Failed to extract lead'));
                  }
                } catch (e) {
                  reject(e);
                }
              });
            });

            req.on('error', reject);
            req.end();
          });

          const leadData = {
            firstName: (response as any).firstName,
            lastName: (response as any).lastName,
            email: (response as any).emails?.[0]?.address || null,
            phone: (response as any).phones?.[0]?.number || null,
            company: (response as any).company || null,
            jobTitle: (response as any).jobTitle || null,
            linkedInUrl: url,
            source: 'lusha_linkedin',
            provider: 'lusha'
          };

          return { url, success: true, lead: leadData };
        } catch (error: any) {
          return { url, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        if (result.success) {
          results.push(result);
        } else {
          errors.push(result);
        }
      }

      // Rate limiting - wait between batches
      if (i + batchSize < linkedInUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    }

    // Log bulk extraction
    await admin.firestore().collection('leadExtractions').add({
      type: 'bulk',
      urls: linkedInUrls,
      provider: provider || 'lusha',
      resultsCount: results.length,
      errorsCount: errors.length,
      createdBy: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      results,
      errors,
      total: linkedInUrls.length,
      extracted: results.length,
      failed: errors.length
    };

  } catch (error: any) {
    console.error('Error in bulk extraction:', error);
    throw new functions.https.HttpsError('internal', `Failed to bulk extract leads: ${error.message}`);
  }
});

// Enrich existing contact with additional data
export const enrichContact = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { contactId, email, firstName, lastName, company, provider } = data;
  
  if (!email && !firstName || !lastName) {
    throw new functions.https.HttpsError('invalid-argument', 'Either email or first name + last name is required');
  }

  try {
    const providerConfig = functions.config()[provider?.toLowerCase() || 'lusha'];
    
    if (!providerConfig || !providerConfig.api_key) {
      throw new functions.https.HttpsError('failed-precondition', `${provider || 'Lusha'} API key is not configured.`);
    }

    const selectedProvider = (provider?.toLowerCase() || 'lusha') as string;
    let enrichedData: any = null;

    if (selectedProvider === 'lusha') {
      // Lusha enrichment by email
      const https = require('https');
      
      const response = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.lusha.com',
          path: `/person?email=${encodeURIComponent(email)}`,
          method: 'GET',
          headers: {
            'api-key': providerConfig.api_key,
            'Content-Type': 'application/json'
          }
        };

        const req = https.request(options, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode === 200 && parsed.person) {
                resolve(parsed.person);
              } else {
                reject(new Error(parsed.message || 'Failed to enrich contact'));
              }
            } catch (e) {
              reject(e);
            }
          });
        });

        req.on('error', reject);
        req.end();
      });

      enrichedData = {
        firstName: (response as any).firstName || firstName,
        lastName: (response as any).lastName || lastName,
        email: (response as any).emails?.[0]?.address || email,
        phone: (response as any).phones?.[0]?.number || null,
        company: (response as any).company || company,
        jobTitle: (response as any).jobTitle || null,
        linkedInUrl: (response as any).linkedInUrl || null,
        source: 'lusha_enrichment'
      };

    } else {
      // Apollo or Hunter enrichment can be added here similarly
      throw new functions.https.HttpsError('invalid-argument', `Enrichment for ${selectedProvider} not yet implemented`);
    }

    // Update contact in Firestore if contactId provided
    if (contactId) {
      const contactRef = admin.firestore().collection('contacts').doc(contactId);
      const contactDoc = await contactRef.get();
      
      if (contactDoc.exists) {
        await contactRef.update({
          ...enrichedData,
          enrichedAt: admin.firestore.FieldValue.serverTimestamp(),
          enrichedBy: context.auth.uid
        });
      }
    }

    return {
      success: true,
      enrichedData
    };

  } catch (error: any) {
    console.error('Error enriching contact:', error);
    throw new functions.https.HttpsError('internal', `Failed to enrich contact: ${error.message}`);
  }
});

// ==========================================
// OWN DATA COLLECTION SYSTEM
// ==========================================

// Collect profile data from browser extension
export const collectProfileData = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const profileData = data;
  const userId = context.auth.uid;

  // Validate data
  if (!profileData.name || !profileData.profileUrl) {
    throw new functions.https.HttpsError('invalid-argument', 'Name and profile URL are required');
  }

  try {
    // Normalize LinkedIn URL
    const normalizedUrl = normalizeLinkedInUrl(profileData.profileUrl);
    if (!normalizedUrl) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid LinkedIn URL format');
    }

    // Check if profile already exists
    const profilesRef = admin.firestore().collection('collectedProfiles');
    const existingProfile = await profilesRef
      .where('profileUrl', '==', normalizedUrl)
      .limit(1)
      .get();

    const profileDataToStore = {
      name: profileData.name,
      title: profileData.title || null,
      company: profileData.company || null,
      location: profileData.location || null,
      profileUrl: normalizedUrl,
      linkedInId: extractLinkedInId(normalizedUrl),
      email: null as string | null,
      phone: null as string | null,
      emailVerified: false,
      phoneVerified: false,
      confidenceScore: calculateInitialConfidence(profileData),
      verified: false,
      source: 'browser_extension',
      contributionCount: 1,
      contributors: [userId],
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: userId
    };

    if (!existingProfile.empty) {
      // Update existing profile
      const docId = existingProfile.docs[0].id;
      const existingData = existingProfile.docs[0].data();
      
      await profilesRef.doc(docId).update({
        ...profileDataToStore,
        contributionCount: (existingData.contributionCount || 0) + 1,
        contributors: admin.firestore.FieldValue.arrayUnion(userId),
        createdAt: existingData.createdAt || admin.firestore.FieldValue.serverTimestamp()
      });

      // Trigger enrichment if we have new data
      if (profileData.company && !existingData.email) {
        enrichProfileData(docId).catch(err => console.error('Enrichment error:', err));
      }

      return { success: true, action: 'updated', profileId: docId };
    } else {
      // Create new profile
      const docRef = await profilesRef.add({
        ...profileDataToStore,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: userId
      });

      // Trigger enrichment process in background
      enrichProfileData(docRef.id).catch(err => console.error('Enrichment error:', err));

      return { success: true, action: 'created', profileId: docRef.id };
    }
  } catch (error: any) {
    console.error('Error collecting profile data:', error);
    throw new functions.https.HttpsError('internal', `Failed to collect profile data: ${error.message}`);
  }
});

// Lookup contact in local database
export const lookupContactLocal = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { linkedInUrl, name, company } = data;

  try {
    const profilesRef = admin.firestore().collection('collectedProfiles');
    let query: FirebaseFirestore.Query = profilesRef;

    if (linkedInUrl) {
      const normalizedUrl = normalizeLinkedInUrl(linkedInUrl);
      if (normalizedUrl) {
        query = query.where('profileUrl', '==', normalizedUrl);
      } else {
        return { found: false, reason: 'Invalid LinkedIn URL' };
      }
    } else if (name && company) {
      // Fuzzy matching by name and company
      query = query.where('company', '==', company);
      // Note: Firestore doesn't support fuzzy matching directly
      // We'll filter by exact company match and then filter results in memory
    } else {
      throw new functions.https.HttpsError('invalid-argument', 'LinkedIn URL or name+company required');
    }

    const results = await query.limit(10).get();

    if (results.empty) {
      return { found: false };
    }

    // If we have name filter, do fuzzy matching
    let matchedProfiles: any[] = results.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    
    if (name && !linkedInUrl) {
      matchedProfiles = matchedProfiles.filter((profile: any) => 
        fuzzyMatchNames(name, profile.name || '')
      );
    }

    if (matchedProfiles.length === 0) {
      return { found: false };
    }

    // Return the best match (highest confidence score)
    const bestMatch = matchedProfiles.sort((a: any, b: any) => 
      (b.confidenceScore || 0) - (a.confidenceScore || 0)
    )[0];

    return {
      found: true,
      data: {
        firstName: extractFirstName(bestMatch.name),
        lastName: extractLastName(bestMatch.name),
        email: bestMatch.email || null,
        phone: bestMatch.phone || null,
        company: bestMatch.company || null,
        jobTitle: bestMatch.title || null,
        linkedInUrl: bestMatch.profileUrl || null,
        confidence: bestMatch.confidenceScore || 0,
        verified: bestMatch.verified || false,
        source: 'local_database'
      }
    };
  } catch (error: any) {
    console.error('Error looking up contact locally:', error);
    throw new functions.https.HttpsError('internal', `Failed to lookup contact: ${error.message}`);
  }
});

// Internal helper for hybrid lookup (used by extractLeadFromLinkedIn)
async function lookupContactHybridInternal(linkedInUrl: string, provider: string, userId: string): Promise<any> {
  try {
    // Step 1: Try local database first
    const localResult = await lookupContactLocalLocal(linkedInUrl, userId);
    
    if (localResult.found && localResult.data && 
        (localResult.data.confidence || 0) >= 70 && 
        (localResult.data.email || localResult.data.phone)) {
      return {
        success: true,
        firstName: localResult.data.firstName,
        lastName: localResult.data.lastName,
        email: localResult.data.email,
        phone: localResult.data.phone,
        company: localResult.data.company,
        jobTitle: localResult.data.jobTitle,
        linkedInUrl: localResult.data.linkedInUrl,
        source: 'local_database',
        provider: 'local'
      };
    }

    // Step 2: Fall back to API if local lookup failed or confidence too low
    const apiResult = await extractLeadFromLinkedInLocal(linkedInUrl, provider, userId);
    
    if (apiResult.success && apiResult.data) {
      // Store API result in local database for future use
      await storeApiResultInDatabase(apiResult.data, linkedInUrl, userId);
      
      return {
        success: true,
        firstName: apiResult.data.firstName,
        lastName: apiResult.data.lastName,
        email: apiResult.data.email,
        phone: apiResult.data.phone,
        company: apiResult.data.company,
        jobTitle: apiResult.data.jobTitle,
        linkedInUrl: apiResult.data.linkedInUrl,
        source: apiResult.provider || 'api',
        provider: apiResult.provider || 'lusha'
      };
    }

    return { success: false };
  } catch (error: any) {
    console.error('Error in hybrid lookup:', error);
    return { success: false, error: error.message };
  }
}

// Hybrid lookup: Try local database first, then fall back to APIs
export const lookupContactHybrid = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { linkedInUrl, provider } = data;

  try {
    // Step 1: Try local database first
    const localResult = await lookupContactLocalLocal(linkedInUrl, context.auth.uid);
    
    if (localResult.found && localResult.data && 
        (localResult.data.confidence || 0) >= 70 && 
        (localResult.data.email || localResult.data.phone)) {
      return {
        success: true,
        data: localResult.data,
        source: 'local_database',
        fromCache: true
      };
    }

    // Step 2: Fall back to API if local lookup failed or confidence too low
    console.log('Local lookup failed or low confidence, falling back to API');
    
    // Import the existing extractLeadFromLinkedIn logic
    const apiResult = await extractLeadFromLinkedInLocal(linkedInUrl, provider, context.auth.uid);
    
    if (apiResult.success && apiResult.data) {
      // Store API result in local database for future use
      await storeApiResultInDatabase(apiResult.data, linkedInUrl, context.auth.uid);
      
      return {
        success: true,
        data: apiResult.data,
        source: apiResult.provider || 'api',
        fromCache: false
      };
    }

    // If both failed, return the local result if available (even if low confidence)
    if (localResult.found) {
      return {
        success: true,
        data: localResult.data,
        source: 'local_database',
        fromCache: true,
        lowConfidence: true
      };
    }

    return {
      success: false,
      message: 'No contact data found in local database or via API'
    };

  } catch (error: any) {
    console.error('Error in hybrid lookup:', error);
    throw new functions.https.HttpsError('internal', `Failed to lookup contact: ${error.message}`);
  }
});

// Enrich profile data (discover email/phone)
async function enrichProfileData(profileId: string): Promise<void> {
  try {
    const profileRef = admin.firestore().collection('collectedProfiles').doc(profileId);
    const profile = await profileRef.get();

    if (!profile.exists) return;

    const profileData = profile.data()!;

    // Only enrich if we have name and company
    if (!profileData.name || !profileData.company) {
      return;
    }

    // Try to discover email
    if (!profileData.email) {
      const email = await discoverEmail(profileData);
      if (email) {
        await profileRef.update({
          email,
          emailVerified: false,
          emailDiscoveredAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    // Try to discover phone (optional, can be implemented later)
    // const phone = await discoverPhone(profileData);
    // if (phone) {
    //   await profileRef.update({
    //     phone,
    //     phoneVerified: false,
    //     phoneDiscoveredAt: admin.firestore.FieldValue.serverTimestamp()
    //   });
    // }

  } catch (error) {
    console.error('Error enriching profile data:', error);
    // Don't throw - enrichment is optional
  }
}

// Discover email using pattern recognition
async function discoverEmail(profileData: any): Promise<string | null> {
  // This is a simplified version
  // In production, you'd want to:
  // 1. Scrape company website for email patterns
  // 2. Try common email patterns
  // 3. Verify via SMTP check
  
  if (!profileData.name || !profileData.company) {
    return null;
  }

  // For now, return null - this would need website scraping implementation
  // See BUILD_YOUR_OWN_LUSHA.md for full implementation
  return null;
}

// Store API result in local database
async function storeApiResultInDatabase(apiData: any, linkedInUrl: string, userId: string): Promise<void> {
  try {
    const normalizedUrl = normalizeLinkedInUrl(linkedInUrl);
    if (!normalizedUrl) return;

    const profilesRef = admin.firestore().collection('collectedProfiles');
    const existingProfile = await profilesRef
      .where('profileUrl', '==', normalizedUrl)
      .limit(1)
      .get();

    const profileData = {
      name: `${apiData.firstName || ''} ${apiData.lastName || ''}`.trim(),
      title: apiData.jobTitle || null,
      company: apiData.company || null,
      location: null,
      profileUrl: normalizedUrl,
      linkedInId: extractLinkedInId(normalizedUrl),
      email: apiData.email || null,
      phone: apiData.phone || null,
      emailVerified: false,
      phoneVerified: false,
      confidenceScore: 85, // High confidence from API
      verified: false,
      source: 'api_enrichment',
      contributionCount: 1,
      contributors: [userId],
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: userId
    };

    if (!existingProfile.empty) {
      // Update existing
      await profilesRef.doc(existingProfile.docs[0].id).update({
        ...profileData,
        email: apiData.email || existingProfile.docs[0].data().email,
        phone: apiData.phone || existingProfile.docs[0].data().phone,
        contributionCount: admin.firestore.FieldValue.increment(1),
        contributors: admin.firestore.FieldValue.arrayUnion(userId),
        createdAt: existingProfile.docs[0].data().createdAt || admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Create new
      await profilesRef.add({
        ...profileData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: userId
      });
    }
  } catch (error) {
    console.error('Error storing API result:', error);
    // Don't throw - this is optional
  }
}

// Helper function to call lookupContactLocal internally
async function lookupContactLocalLocal(linkedInUrl: string, userId: string): Promise<any> {
  const profilesRef = admin.firestore().collection('collectedProfiles');
  const normalizedUrl = normalizeLinkedInUrl(linkedInUrl);
  
  if (!normalizedUrl) {
    return { found: false };
  }

  const results = await profilesRef
    .where('profileUrl', '==', normalizedUrl)
    .limit(1)
    .get();

  if (results.empty) {
    return { found: false };
  }

  const profile = results.docs[0].data();
  return {
    found: true,
    data: {
      firstName: extractFirstName(profile.name),
      lastName: extractLastName(profile.name),
      email: profile.email || null,
      phone: profile.phone || null,
      company: profile.company || null,
      jobTitle: profile.title || null,
      linkedInUrl: profile.profileUrl || null,
      confidence: profile.confidenceScore || 0,
      verified: profile.verified || false,
      source: 'local_database'
    }
  };
}

// Helper function to call extractLeadFromLinkedIn internally
async function extractLeadFromLinkedInLocal(linkedInUrl: string, provider: string, userId: string): Promise<any> {
  // Reuse existing extractLeadFromLinkedIn logic
  // This is a simplified version - in production you'd refactor to extract the core logic
  const providerConfig = functions.config()[provider?.toLowerCase() || 'lusha'];
  
  if (!providerConfig || !providerConfig.api_key) {
    throw new Error(`${provider || 'Lusha'} API key is not configured`);
  }

  const linkedInId = extractLinkedInId(linkedInUrl);
  if (!linkedInId) {
    throw new Error('Invalid LinkedIn URL format');
  }

  // Call Lusha API (simplified - full implementation would handle all providers)
  if (provider?.toLowerCase() === 'lusha' || !provider) {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.lusha.com',
        path: `/person?linkedInUrl=${encodeURIComponent(linkedInUrl)}`,
        method: 'GET',
        headers: {
          'api-key': providerConfig.api_key,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200 && parsed.person) {
              resolve({
                success: true,
                provider: 'lusha',
                data: {
                  firstName: parsed.person.firstName,
                  lastName: parsed.person.lastName,
                  email: parsed.person.emails?.[0]?.address || null,
                  phone: parsed.person.phones?.[0]?.number || null,
                  company: parsed.person.company || null,
                  jobTitle: parsed.person.jobTitle || null,
                  linkedInUrl: linkedInUrl,
                  source: 'lusha_linkedin'
                }
              });
            } else {
              reject(new Error(parsed.message || 'Failed to extract lead'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  throw new Error(`Provider ${provider} not supported`);
}

// Helper functions for data processing
function normalizeLinkedInUrl(url: string): string | null {
  if (!url) return null;
  
  // Remove trailing slashes and normalize
  url = url.trim().replace(/\/$/, '');
  
  // Ensure it's a LinkedIn profile URL
  if (!url.match(/linkedin\.com\/in\/[^\/\s]+/i)) {
    return null;
  }
  
  // Normalize to https://www.linkedin.com/in/username format
  url = url.replace(/^https?:\/\/(www\.)?linkedin\.com/, 'https://www.linkedin.com');
  if (!url.startsWith('http')) {
    url = 'https://www.linkedin.com' + (url.startsWith('/') ? url : '/' + url);
  }
  
  return url;
}

function calculateInitialConfidence(profileData: any): number {
  let score = 50; // Base score

  if (profileData.name) score += 20;
  if (profileData.company) score += 15;
  if (profileData.title) score += 10;
  if (profileData.location) score += 5;

  return Math.min(100, score);
}

function fuzzyMatchNames(name1: string, name2: string): boolean {
  // Simple fuzzy matching - compare normalized names
  const normalize = (n: string) => n.toLowerCase().trim().replace(/\s+/g, ' ');
  const n1 = normalize(name1);
  const n2 = normalize(name2);
  
  // Exact match
  if (n1 === n2) return true;
  
  // Check if one contains the other (for partial matches)
  if (n1.includes(n2) || n2.includes(n1)) return true;
  
  // Check first and last name separately
  const parts1 = n1.split(' ');
  const parts2 = n2.split(' ');
  if (parts1.length >= 2 && parts2.length >= 2) {
    // Both have first and last name
    if (parts1[0] === parts2[0] && parts1[parts1.length - 1] === parts2[parts2.length - 1]) {
      return true;
    }
  }
  
  return false;
}

function extractFirstName(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts[0] || '';
}

function extractLastName(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : '';
}

// Helper functions
function extractLinkedInId(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/i);
  return match ? match[1] : null;
}

function extractDomainFromLinkedInUrl(url: string): string | null {
  // This is a simplified version - in production, you'd need more sophisticated extraction
  // For now, return null and let the API handle it
  return null;
}
