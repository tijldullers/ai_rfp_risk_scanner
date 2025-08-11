import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter based on environment
function createTransporter() {
  // For development/testing, use a simple test configuration
  if (process.env.NODE_ENV !== 'production' || process.env.EMAIL_SERVICE === 'ethereal') {
    // Use a simple test transporter that logs emails instead of sending them
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  // For production, use environment variables for real email service
  // Supports Gmail, SendGrid, AWS SES, etc.
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  switch (emailService.toLowerCase()) {
    case 'gmail':
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
        }
      });
    
    case 'sendgrid':
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    
    case 'ses':
      return nodemailer.createTransport({
        host: process.env.SES_HOST || 'email-smtp.us-east-1.amazonaws.com',
        port: 587,
        auth: {
          user: process.env.SES_ACCESS_KEY,
          pass: process.env.SES_SECRET_KEY
        }
      });
    
    default:
      // Generic SMTP configuration
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
  }
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@ai-rfp-scanner.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    
    // For development/testing, log the email content instead of sending
    if (process.env.NODE_ENV !== 'production' || process.env.EMAIL_SERVICE === 'ethereal') {
      console.log('📧 EMAIL SENT (TEST MODE)');
      console.log('='.repeat(50));
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('From:', mailOptions.from);
      console.log('Message ID:', info.messageId);
      
      // Log the email content for debugging
      if (info.messageId) {
        console.log('Email Content Preview:');
        console.log('Message ID: ' + info.messageId);
      }
      console.log('='.repeat(50));
    } else {
      console.log('Email sent successfully:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject
      });

      // For production with real email services, log preview URL if available
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Preview URL:', previewUrl);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function generateVerificationEmailHTML(verificationLink: string, reportFileName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - AI RFP Risk Scanner</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background: #5a6fd8; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔒 Email Verification Required</h1>
            <p>AI RFP Risk Scanner</p>
        </div>
        
        <div class="content">
            <h2>Verify your email to access your full report</h2>
            
            <p>Hello,</p>
            
            <p>You've requested access to the full risk analysis report${reportFileName ? ` for <strong>${reportFileName}</strong>` : ''}. To ensure security and prevent unauthorized access, please verify your email address.</p>
            
            <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email & Access Report</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace;">
                ${verificationLink}
            </p>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> This verification link will expire in 24 hours for security reasons. If you didn't request this report, you can safely ignore this email.
            </div>
            
            <p>Once verified, you'll have access to:</p>
            <ul>
                <li>📊 Detailed risk assessment breakdown</li>
                <li>📋 Comprehensive recommendations</li>
                <li>📈 Risk scoring methodology</li>
                <li>📄 Downloadable PDF report</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            The AI RFP Risk Scanner Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to verify your access to the AI RFP Risk Scanner report.</p>
            <p>© 2025 AI RFP Risk Scanner. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;
}
