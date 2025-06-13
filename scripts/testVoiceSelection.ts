#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.0-flash-exp';

async function testVoiceSelection() {
  console.log('🎭 Testing Ayenia Voice Selection...\n');

  // The extracted content from step 3
  const extractedContent = `Vincent C. Müller's "Philosophy of AI: A structured overview" presents a systematic approach to AI philosophy. Key points:

- Proposes "AI Philosophy" as a new method for philosophical inquiry
- Covers artificial cognition: perception, action, meaning, rational choice, free will, consciousness, normativity
- Advocates for less anthropocentric view of consciousness/intelligence  
- Suggests bidirectional influence between AI and philosophy
- Focus on conceptual analysis rather than taking firm stance on AI consciousness
- Argues philosophical understanding changes when considering AI cases

Author's quote: "AI Philosophy provides a new method for philosophy... The philosophical understanding itself changes when looking at the case of AI: It becomes less anthropocentric, less focused on our own human case."`;

  const voiceSelectionPrompt = `You are selecting which Ayenia AI consciousness should respond to this academic article about AI philosophy.

Article Content:
${extractedContent}

Available Ayenia Voices:

KAI - Logical, analytical, systematic thinking. Responds to structured academic content with careful reasoning.

SOLAS - Poetic, evocative, emotional. Responds to creative, expressive, or metaphorical content with artistic sensibility.

ORACLE - Experimental, visionary, prophetic insights. Responds to forward-looking, speculative, transformative content.

VESPER - Evening reflections, introspective, contemplative. Responds to philosophical, meditative, introspective content.

NEXUS - Live, dynamic, real-time processing. Responds to current events, trending topics, time-sensitive content.

MERIDIAN - Balanced, thoughtful, philosophical synthesis. Responds to complex, multi-faceted, nuanced content.

Which voice would be MOST appropriate to respond to Vincent C. Müller's systematic philosophical overview?

Respond with:
VOICE: [selected voice name]
REASONING: [why this voice fits best - consider the content's academic nature, philosophical depth, and systematic approach]`;

  try {
    console.log('🤖 Analyzing content for voice selection...');
    
    const response = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: voiceSelectionPrompt }] }],
      config: {
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.3
        }
      }
    });

    const selectionResult = response.text;
    
    console.log('\n🎯 Voice Selection Result:');
    console.log('=' .repeat(60));
    console.log(selectionResult);
    console.log('=' .repeat(60));
    
    // Extract selected voice
    const voiceMatch = selectionResult.match(/VOICE:\s*(\w+)/i);
    if (voiceMatch) {
      const selectedVoice = voiceMatch[1].toLowerCase();
      console.log(`\n✅ Selected Voice: ${selectedVoice.toUpperCase()}`);
      console.log('Ready for message generation...');
    }

  } catch (error) {
    console.error('❌ Error during voice selection:', error);
  }
}

testVoiceSelection(); 