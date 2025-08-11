
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { sendEmail, generateVerificationEmailHTML } from '@/lib/email';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, reportId } = await request.json();

    if (!email || !reportId) {
      return NextResponse.json({ error: 'Email and report ID are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Generate verification token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create email verification record
    await prisma.emailVerification.create({
      data: {
        email,
        token,
        reportId,
        expiresAt
      }
    });

    // Update report with anonymous email
    await prisma.report.update({
      where: { id: reportId },
      data: { anonymousEmail: email }
    });

    // Generate verification link
    const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
    
    // Send verification email
    const emailHTML = generateVerificationEmailHTML(verificationLink, report.fileName);
    const emailSent = await sendEmail({
      to: email,
      subject: 'Verify Your Email - AI RFP Risk Scanner Report Access',
      html: emailHTML
    });

    if (!emailSent) {
      console.error('Failed to send verification email to:', email);
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    console.log('Verification email sent successfully to:', email);
    console.log('Verification link:', verificationLink);

    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent successfully! Please check your inbox and spam folder.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}
