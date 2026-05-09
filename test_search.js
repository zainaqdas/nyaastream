const si = require('./src/si');

async function test() {
  console.log('Searching for One Piece 1000 on Nyaa...');
  try {
    const results = await si.search('One Piece 1000', 5, { category: '1_0' });
    console.log(`Found ${results.length} results.`);
    results.forEach(r => console.log(`- ${r.name} (${r.seeders} seeders)`));
  } catch (err) {
    console.error('Search failed:', err.message);
  }
}

test();
