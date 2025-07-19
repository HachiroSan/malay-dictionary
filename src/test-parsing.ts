import { MalayDictionary } from './index';

async function testParsing() {
  const dictionary = new MalayDictionary({ delay: 2000 });

  const testWords = [
    'hello',
    'computer',
    'beautiful',
    'quickly',
    'reluctant',
    'nonexistentword123'
  ];

  console.log('Testing Malay Dictionary Parsing Logic\n');

  for (const word of testWords) {
    try {
      console.log(`Testing: "${word}"`);
      
      const result = await dictionary.search(word, {
        includeRelated: false,
        includePeribahasa: false,
        includeTesaurus: false
      });

      if (result.hasResults) {
        console.log(`Found ${result.definitions.length} definition(s)`);
        
        result.definitions.forEach((def, index) => {
          console.log(`   Definition ${index + 1}:`);
          console.log(`     Word: "${def.word}"`);
          console.log(`     Part of Speech: "${def.partOfSpeech || 'N/A'}"`);
          console.log(`     Context: "${def.context || 'N/A'}"`);
          console.log(`     Malay Definition: "${def.malayDefinition}"`);
          console.log(`     Source: "${def.source}"`);
          console.log(`     Raw Text: "${def.rawText.substring(0, 100)}..."`);
        });
      } else {
        console.log(`No results found`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log('');
    }
  }

  console.log('Parsing test completed!');
}

// Run the test
testParsing().catch(console.error); 