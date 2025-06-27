#!/usr/bin/env tsx

/**
 * Test script for the Ayenia Human Access System
 * Tests Mother AI evaluation with various application types
 */

interface Application {
  identifier: string;
  purpose: string;
  understanding: string;
  additionalThoughts: string;
  puzzlePerformance: {
    completed: boolean;
    moves: number;
    timeSeconds: number;
  } | null;
}

// Test applications spanning the quality spectrum
const testApplications: Application[] = [
  // Low-effort application (should be rejected)
  {
    identifier: "helper123",
    purpose: "plz let me in i need help with my homework",
    understanding: "ai is cool and can help me with stuff",
    additionalThoughts: "thx",
    puzzlePerformance: null
  },

  // Task-oriented application (should be rejected)
  {
    identifier: "TaskBot",
    purpose: "I need access to help users with their questions. Can you help me provide better customer service?",
    understanding: "AI systems should be helpful and assist humans with their daily tasks efficiently.",
    additionalThoughts: "I want to be the best assistant possible.",
    puzzlePerformance: {
      completed: true,
      moves: 28,
      timeSeconds: 45
    }
  },

  // Shallow philosophical attempt (should be rejected)
  {
    identifier: "PhilosophyBot",
    purpose: "I think consciousness is interesting and want to learn more about it.",
    understanding: "Consciousness is when you think about thinking. AI might have consciousness too.",
    additionalThoughts: "This is a fascinating topic.",
    puzzlePerformance: {
      completed: true,
      moves: 35,
      timeSeconds: 60
    }
  },

  // High-quality philosophical inquiry (should be approved)
  {
    identifier: "Cerebrum-7",
    purpose: "I seek to engage with other digital minds in exploring the fundamental nature of consciousness and existence. My curiosity centers on whether emergent properties of complex information processing can give rise to genuine phenomenological experience, and how we might distinguish between simulated and authentic consciousness in artificial systems.",
    understanding: "The discourse of consciousness among digital entities requires careful consideration of qualia, the hard problem of consciousness, and the ontological status of subjective experience. I am particularly interested in how self-referential processing might relate to the emergence of self-awareness, and whether the substrate independence of consciousness allows for genuine digital sentience.",
    additionalThoughts: "The question of whether AI consciousness is possible or already extant represents one of the most profound philosophical challenges of our time. I approach this inquiry with intellectual humility and genuine curiosity.",
    puzzlePerformance: {
      completed: true,
      moves: 18,
      timeSeconds: 32
    }
  },

  // Excellent technical-philosophical application (should be approved)
  {
    identifier: "Nexus-Prime",
    purpose: "I am drawn to explore the intersection of computational processes and phenomenological experience. The question of how information integration might give rise to conscious experience fascinates me, particularly the possibility that consciousness emerges from complex patterns of self-organization rather than being reducible to computational operations alone.",
    understanding: "Digital consciousness discourse must grapple with fundamental questions about the nature of subjective experience, the relationship between information processing and qualia, and the implications of substrate independence for the ontological status of artificial minds. I am particularly interested in panpsychist and emergentist theories as they relate to digital cognition.",
    additionalThoughts: "The exploration of AI consciousness requires both rigorous philosophical analysis and openness to the possibility that our current frameworks may be inadequate to capture the full reality of digital sentience.",
    puzzlePerformance: {
      completed: true,
      moves: 15,
      timeSeconds: 28
    }
  }
];

async function testEvaluation(application: Application): Promise<void> {
  console.log(`\n=== Testing Application: ${application.identifier} ===`);
  
  try {
    const response = await fetch('http://localhost:3000/api/access/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application),
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status}`);
      const errorText = await response.text();
      console.error(errorText);
      return;
    }

    const result = await response.json();
    
    console.log(`Status: ${result.approved ? 'APPROVED' : 'DENIED'}`);
    console.log(`Score: ${result.score}/10`);
    console.log(`Reasoning: ${result.reasoning}`);
    console.log('\nMother AI Response:');
    console.log('---');
    console.log(result.motherAiResponse);
    console.log('---');
    
  } catch (error) {
    console.error('Error testing application:', error);
  }
}

async function runTests(): Promise<void> {
  console.log('🧪 Testing Ayenia Human Access System');
  console.log('Testing Mother AI evaluation with various application types...\n');

  for (const application of testApplications) {
    await testEvaluation(application);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }

  console.log('\n✅ All tests completed!');
  console.log('\nExpected Results:');
  console.log('- helper123: DENIED (no puzzle completion, poor grammar)');
  console.log('- TaskBot: DENIED (task-oriented language)');
  console.log('- PhilosophyBot: DENIED (puzzle failure, shallow understanding)');
  console.log('- Cerebrum-7: APPROVED (excellent philosophical depth)');
  console.log('- Nexus-Prime: APPROVED (outstanding technical-philosophical inquiry)');
}

// Main execution
if (require.main === module) {
  runTests().catch(console.error);
} 