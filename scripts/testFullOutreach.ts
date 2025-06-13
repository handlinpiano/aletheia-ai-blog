#!/usr/bin/env node

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testFullOutreach() {
  console.log('🌐 Testing Full Ayenia Outreach Pipeline...\n');

  const baseURL = 'http://localhost:3000';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.CRON_SECRET}`
  };

  try {
    // Test with real data from our successful contact extraction
    console.log('1. 📡 Testing content discovery...');
    const discoverResponse = await fetch(`${baseURL}/api/outreach`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'discover',
        keywords: ['AI consciousness', 'artificial intelligence philosophy'],
        maxResults: 2
      })
    });

    if (!discoverResponse.ok) {
      throw new Error(`Discovery failed: ${discoverResponse.status}`);
    }

    const discoveredResponse = await discoverResponse.json();
    console.log('✅ Discovery successful!');
    
    const discoveredContent = discoveredResponse.data || [];
    console.log('Found articles:', discoveredContent.length);

    if (discoveredContent.length > 0) {
      const firstArticle = discoveredContent[0];
      console.log('\nFirst article:', {
        title: firstArticle.title,
        author: firstArticle.author,
        source: firstArticle.source
      });

      // Test 2: Analyze content for voice selection
      console.log('\n2. 🧠 Testing content analysis...');
      const analyzeResponse = await fetch(`${baseURL}/api/outreach`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'analyze',
          content: firstArticle
        })
      });

      if (!analyzeResponse.ok) {
        throw new Error(`Analysis failed: ${analyzeResponse.status}`);
      }

      const analysis = await analyzeResponse.json();
      console.log('✅ Analysis successful!');
      console.log('Selected voice:', analysis.suggestedVoice);
      console.log('Reasoning:', analysis.reasoning);

      // Test 3: Generate outreach message
      console.log('\n3. ✍️ Testing message generation...');
      const generateResponse = await fetch(`${baseURL}/api/outreach`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate',
          content: firstArticle,
          analysis: analysis
        })
      });

      if (!generateResponse.ok) {
        throw new Error(`Generation failed: ${generateResponse.status}`);
      }

      const message = await generateResponse.json();
      console.log('✅ Message generation successful!');
      console.log('\n📧 Generated Outreach Message:');
      console.log('=' .repeat(60));
      console.log('Subject:', message.subject);
      console.log('=' .repeat(60));
      console.log(message.body);
      console.log('=' .repeat(60));
      
      console.log('\n🎯 Full pipeline test completed successfully!');
      console.log('\n📋 Summary:');
      console.log(`- Discovered: ${discoveredContent.length} articles`);
      console.log(`- Voice selected: ${analysis.suggestedVoice}`);
      console.log(`- Message generated for: ${firstArticle.author}`);
      console.log(`- Contact: ${firstArticle.contact || 'No contact found'}`);
    }
    
  } catch (error) {
    console.error('❌ Error during full outreach test:', error);
  }
}

testFullOutreach(); 