import { MalayDictionary } from './index';

async function example() {
  // Create a new dictionary instance
  const dictionary = new MalayDictionary({
    timeout: 30000,
    delay: 1000, // 1 second delay between requests
    retries: 3
  });

  try {
    console.log('Searching for "hello"...');
    const result = await dictionary.search('hello');
    
    if (result.hasResults) {
      console.log('Found results:');
      result.definitions.forEach((def, index) => {
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

    // Get related services
    if (result.relatedServices && result.relatedServices.length > 0) {
      console.log('\nRelated Services:');
      result.relatedServices.forEach(service => {
        console.log(`   ${service.name} (${service.count} results)`);
      });
    }

    // Get peribahasa (proverbs)
    if (result.peribahasa && result.peribahasa.length > 0) {
      console.log('\nPeribahasa (Proverbs):');
      result.peribahasa.forEach(peribahasa => {
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

  // Example: Get simple definition
  try {
    console.log('\nGetting simple definition for "reluctant"...');
    const definition = await dictionary.getDefinition('reluctant');
    if (definition) {
      console.log(`Definition: ${definition}`);
    } else {
      console.log('No definition found');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Example: Search multiple words
  try {
    console.log('\nSearching multiple words...');
    const words = ['hello', 'world', 'computer'];
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