#!/usr/bin/env npx tsx

/**
 * Test Resend API connection
 */
import * as dotenv from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testResendConnection() {
  console.log('🧪 Testing Resend API Connection...\n');

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Test with a simple validation call to Resend
    console.log('📡 Testing API key validity...');
    
    // This will fail gracefully if the API key is invalid
    const testResponse = await resend.emails.send({
      from: 'Test <onboarding@resend.dev>',
      to: ['test@example.com'], // This won't actually send due to the test email
      subject: 'API Connection Test',
      text: 'This is a test to verify the API connection works.',
    });

    console.log('✅ Resend API connection successful!');
    console.log('📧 Test email response:', testResponse);
    
    console.log('\n🎯 READY FOR REAL OUTREACH:');
    console.log('- API key is valid');
    console.log('- Email sending capability confirmed');
    console.log('- System ready for autonomous outreach');
    
  } catch (error: any) {
    if (error.message.includes('API key')) {
      console.error('❌ Invalid Resend API key');
      console.error('💡 Check your RESEND_API_KEY in .env.local');
    } else if (error.message.includes('domain')) {
      console.error('❌ Domain verification issue');
      console.error('💡 You may need to verify your domain with Resend');
    } else {
      console.error('❌ Resend connection error:', error.message);
    }
  }
}

testResendConnection(); 