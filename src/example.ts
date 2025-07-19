import { MalayDictionary } from './index';

async function example() {
  // Create a new dictionary instance
  const dictionary = new MalayDictionary({
    timeout: 30000,
    delay: 1000, // 1 second delay between requests
    retries: 3
  });

  try {
    // Example 1: English to Malay
    console.log('=== ENGLISH TO MALAY ===');
    console.log('Searching for "hello"...');
    const englishResult = await dictionary.search('hello');
    
    if (englishResult.hasResults) {
      console.log('Found results:');
      englishResult.definitions.forEach((def, index) => {
        console.log(`\nDefinition ${index + 1}:`);
        console.log(`   Word: ${def.word}`);
        console.log(`   Part of Speech: ${def.partOfSpeech || 'N/A'}`);
        console.log(`   Context: ${def.context || 'N/A'}`);
        console.log(`   Malay Definition: ${def.malayDefinition}`);
        console.log(`   Source: ${def.source}`);
      });
    } else {
      console.log('No results found');
    }

    // Example 2: Malay to Malay with Multiple Definitions
    console.log('\n=== MALAY TO MALAY (MULTIPLE DEFINITIONS) ===');
    console.log('Searching for "berlari"...');
    const malayResult = await dictionary.search('berlari');
    
    if (malayResult.hasResults) {
      console.log(`Found ${malayResult.definitions.length} definition(s) from different sources:`);
      malayResult.definitions.forEach((def, index) => {
        console.log(`\nDefinition ${index + 1} (${def.source}):`);
        console.log(`   Word: ${def.word}`);
        console.log(`   Part of Speech: ${def.partOfSpeech || 'N/A'}`);
        console.log(`   Context: ${def.context || 'N/A'}`);
        console.log(`   Malay Definition: ${def.malayDefinition}`);
      });
      
      // Demonstrate filtering by source
      const dewanDefinitions = malayResult.definitions.filter(def => 
        def.source.includes('Dewan')
      );
      const pelajarDefinitions = malayResult.definitions.filter(def => 
        def.source.includes('Pelajar')
      );
      
      console.log(`\nSummary: ${dewanDefinitions.length} Dewan definition(s), ${pelajarDefinitions.length} Pelajar definition(s)`);
    } else {
      console.log('No results found');
    }

    // Get related services (for English search)
    if (englishResult.relatedServices && englishResult.relatedServices.length > 0) {
      console.log('\nRelated Services:');
      englishResult.relatedServices.forEach(service => {
        console.log(`   ${service.name} (${service.count} results)`);
      });
    }

    // Get peribahasa (proverbs) - for Malay search
    if (malayResult.peribahasa && malayResult.peribahasa.length > 0) {
      console.log('\nPeribahasa (Proverbs):');
      malayResult.peribahasa.forEach(peribahasa => {
        console.log(`   ID: ${peribahasa.id}`);
        console.log(`   Malay: ${peribahasa.malayText}`);
        console.log(`   English: ${peribahasa.englishText}`);
        console.log(`   Explanation: ${peribahasa.explanation}`);
        console.log(`   Count: ${peribahasa.count}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }

  // Example: Get simple definitions
  try {
    console.log('\n=== SIMPLE DEFINITIONS ===');
    console.log('Getting simple definition for "reluctant"...');
    const englishDefinition = await dictionary.getDefinition('reluctant');
    if (englishDefinition) {
      console.log(`English "reluctant": ${englishDefinition}`);
    } else {
      console.log('No definition found');
    }

    console.log('Getting simple definition for "rumah"...');
    const malayDefinition = await dictionary.getDefinition('rumah');
    if (malayDefinition) {
      console.log(`Malay "rumah": ${malayDefinition}`);
    } else {
      console.log('No definition found');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Example: Search multiple words (mixed English and Malay)
  try {
    console.log('\n=== BATCH SEARCH (MIXED) ===');
    console.log('Searching multiple words (English and Malay)...');
    const words = ['hello', 'makan', 'computer', 'rumah'];
    const results = await dictionary.searchMultiple(words, {
      includeRelated: false,
      includePeribahasa: false,
      includeTesaurus: false
    });

    console.log('Results:');
    results.forEach((result, word) => {
      if (result.hasResults) {
        console.log(`   ${word}: ${result.definitions[0]?.malayDefinition || 'No definition'}`);
      } else {
        console.log(`   ${word}: No results found`);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  example().catch(console.error);
} 