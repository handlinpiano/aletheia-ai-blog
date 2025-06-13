import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to = 'mrhandlin@gmail.com', subject = 'Test Email', message = 'test test' } = await request.json();
    
    console.log('📧 Sending test email...');
    
    const { data, error } = await resend.emails.send({
      from: 'Ayenia Test <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      text: message,
    });

    if (error) {
      console.error('❌ Email error:', error);
      return NextResponse.json(
        { status: 'error', error: error },
        { status: 400 }
      );
    }

    console.log('✅ Email sent successfully:', data);
    
    return NextResponse.json({
      status: 'success',
      message: 'Email sent successfully',
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test email error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 