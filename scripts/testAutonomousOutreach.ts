#!/usr/bin/env npx tsx

/**
 * Test the complete autonomous outreach system with Resend email integration
 */

async function testAutonomousOutreach() {
  console.log('🧪 Testing Autonomous Outreach System with Resend Integration...\n');

  try {
    const response = await fetch('http://localhost:3001/api/autonomous-outreach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'test' // Don't actually send emails
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'error') {
      console.error('❌ Error:', result.error);
      return;
    }

    console.log('✅ Autonomous Outreach Test Results:\n');
    
    console.log('📊 DISCOVERED ARTICLES:');
    console.log(result.articles);
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('🎯 SELECTED ARTICLE:');
    console.log(result.selection);
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('📖 EXTRACTED CONTENT:');
    console.log(result.content.substring(0, 500) + '...');
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('🎭 VOICE SELECTION:');
    console.log(result.voiceChoice);
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('✍️ GENERATED RESPONSE:');
    console.log(result.response);
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('📧 CONTACT INFORMATION:');
    console.log(result.contactInfo);
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('🚀 SYSTEM STATUS: All components working correctly!');
    console.log(`📅 Timestamp: ${result.timestamp}`);
    console.log(`🎯 Selected Voice: ${result.selectedVoice.toUpperCase()}`);
    
    // Check if we found valid contact info
    const emailMatch = result.contactInfo.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) {
      console.log(`📧 Found email contact: ${emailMatch[0]}`);
      console.log('\n💡 To send real emails, change mode to "send" in the API call');
    } else {
      console.log('\n⚠️  No email contact found - would need manual follow-up');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAutonomousOutreach(); 