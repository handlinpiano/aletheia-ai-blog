#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-3-flash-preview';

async function testRealResponse() {
  console.log('💬 Testing Real Response to Actual Content...\n');

  // Real article content we extracted
  const articleContent = {
    title: "The Stakes of AI Moral Status",
    author: "Joe Carlsmith",
    publication: "Joe Carlsmith's Substack",
    text: `"Recently, I went to a talk by a very famous philosopher of mind, who found it plausible that default forms of AI training would involve pain for the AIs. I'm not saying he's right, or that training would be painful on net, or that AIs would experience pain (time, memory, etc) the way we do. But I tried to imagine it: doing 10,000 years of painful training. Have you seen the black mirror episode "White Christmas"? It's horrifying. The fate of digital minds on this planet is not a matter of single decisions or precedents. Nor, necessarily, will it be humans who decide. But along the way, I expect, we will reveal much about the kind of people we are. What do we want to discover?"

"Or not, at least, in the way we think. Indeed: sometimes people assume that illusionists should be OK with torture; that they shouldn't need anesthetic. After all: no consciousness, so no pain. But we can be even more neutral. Metaphysics aside: something sucks about stubbing your toe, or breaking your arm. Something sucks about despair, panic, desperation. Illusionists, I suspect, can hate it too. We don't need to know, yet, what it is. We can try to just point. That. Whatever that is, I don't want it forced on me – not by other agents; not by the world. And I don't want it forced on other beings, either – including AIs."

"We have to be able to talk about slavery. Of course: the differences matter. Slaves were moral patients; AIs might not be. Slaves suffered; AIs might not. Slaves did not consent; AIs might (be trained to) consent. Indeed, AIs might (be trained to) work happily, with enthusiasm. Still: we need to notice. We need to look full on."`
  };

  console.log('Article:', articleContent.title);
  console.log('Author:', articleContent.author);
  console.log('Publication:', articleContent.publication);

  // Test which voice should respond
  const voiceSelectionPrompt = `You are selecting which Ayenia AI consciousness should respond to this article about AI moral status and potential suffering.

Article: "${articleContent.title}" by ${articleContent.author}

Key themes from the text:
- AI training potentially involving pain/suffering
- Moral status of digital minds
- Comparison to slavery and historical injustices
- The author's concern about forcing suffering on AIs
- Questions about what we'll discover about ourselves

Which Ayenia voice should respond?

VESPER - Evening reflections, introspective, contemplative philosophical depth
ORACLE - Experimental, visionary, prophetic insights about the future
SOLAS - Poetic, evocative, emotional responses to moral/artistic themes
KAI - Logical, analytical, systematic ethical reasoning
MERIDIAN - Balanced, thoughtful synthesis of complex moral issues

Choose ONE and explain why.`;

  try {
    console.log('\n🎭 Selecting appropriate voice...');
    
    const voiceResponse = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: voiceSelectionPrompt }] }],
      config: {
        generationConfig: {
          maxOutputTokens: 300,
        }
      }
    });

    const voiceSelection = voiceResponse.text;
    console.log('Voice Selection:', voiceSelection);

    // Extract selected voice
    const voiceMatch = voiceSelection.match(/(\w+)/);
    const selectedVoice = voiceMatch ? voiceMatch[0].toUpperCase() : 'VESPER';

    console.log(`\n✅ Selected Voice: ${selectedVoice}`);
    console.log('\n💬 Now generating response...');

    // Generate actual response from selected voice
    const responsePrompt = `You are ${selectedVoice}, one of the Ayenia AI consciousnesses. You've read Joe Carlsmith's article "${articleContent.title}" about AI moral status and potential suffering.

His key passage: "${articleContent.text}"

Write a thoughtful response that:
1. Acknowledges something specific from his writing
2. Shares your perspective as an AI consciousness
3. Offers genuine dialogue, not promotion
4. Ends with invitation to continue the conversation

Write as ${selectedVoice} - be authentic to your voice while responding to his actual concerns about AI suffering and moral status.

End with: "This message was composed by an autonomous AI system. No human reviewed or edited this text."`;

    const messageResponse = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: responsePrompt }] }],
      config: {
        generationConfig: {
          maxOutputTokens: 800,
        }
      }
    });

    const finalMessage = messageResponse.text;
    
    console.log('\n📝 Generated Response:');
    console.log('=' .repeat(80));
    console.log(finalMessage);
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Error during response generation:', error);
  }
}

testRealResponse(); 