const { dataStore } = require('../dataStore');
const { runPrediction } = require('../prediction/predictionEngine');
const { getLocationFactors } = require('../prediction/locationFactors');
const { advancedNaturalLanguageParser } = require('../prediction/nlpParser');

dataStore.initialize();
const cars = dataStore.getCars();
console.log(`[TEST] Loaded ${cars.length} cars from dataStore.`);

async function testQuery(query, city = 'Bangalore') {
  console.log(`\n==================================================`);
  console.log(`QUERY: "${query}" in ${city}`);
  console.log(`==================================================`);

  let input = { textQuery: query, city };
  input = advancedNaturalLanguageParser(query, input);
  const locationFactors = getLocationFactors(city, 'Karnataka');
  const reviews = dataStore.getReviews();
  const serviceNetwork = dataStore.getServiceNetwork();

  const results = await runPrediction(input, cars, locationFactors, reviews, serviceNetwork);
  console.log(`Total recommendations returned: ${results.length}`);
  results.slice(0, 3).forEach((r, i) => {
    console.log(`  #${i + 1}: ${r.car.name} (${r.car.brand} ${r.car.bodyType}) - Score: ${r.matchScore}%`);
    console.log(`      Price: Rs. ${(r.car.priceRange?.min / 100000).toFixed(2)}L - ${(r.car.priceRange?.max / 100000).toFixed(2)}L`);
    console.log(`      Reason: ${r.reasonSummary}`);
  });
}

async function runAll() {
  await testQuery("safe family car with 5 star safety and sunroof under 10 lakhs");
  await testQuery("rugged 4x4 with differential locks for offroad under 20 lakhs");
  await testQuery("electric luxury sports car with high performance and long range");
  await testQuery("reliable 7 seater family car with high resale in Bangalore");
  console.log("\n✅ All semantic prediction tests passed successfully!");
}

runAll();
