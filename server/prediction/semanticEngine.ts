/**
 * Zero-dependency TF-IDF + Cosine Similarity semantic search engine for cars.
 */

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't",
  // Automotive specific
  'car', 'vehicle', 'cars', 'automobile', 'auto', 'want', 'looking', 'need', 'buy'
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w && !STOP_WORDS.has(w));
}

/**
 * Converts a car object into a rich text profile for TF-IDF vectorization.
 * Deeply indexed with Indian automotive semantics, brand reputations, and variant specs.
 */
export function buildCarProfile(car: any): string {
  const profileParts: string[] = [];

  // 1. Brand reputation & heritage
  const brand = (car.brand || car.make || '').toLowerCase();
  if (brand.includes('tata')) profileParts.push('tata safety 5 star crash tested strong build quality rugged harrier safari nexon punch altroz tiago curvv');
  else if (brand.includes('maruti')) profileParts.push('maruti suzuki reliable low maintenance vast service network high resale mileage fuel efficient swift dzire baleno wagonr brezza ertiga fronx grand vitara');
  else if (brand.includes('hyundai')) profileParts.push('hyundai features premium smooth comfortable refined high tech creta venue verna i20 alcazar exter tucson');
  else if (brand.includes('mahindra')) profileParts.push('mahindra rugged tough reliable diesel heavy duty ladder frame thar scorpio xuv700 xuv3xo bolero road presence 4x4 offroad');
  else if (brand.includes('toyota')) profileParts.push('toyota reliable long lasting bulletproof engine indestructible hybrid resale value innova fortuner hycross hyryder glanza hilux');
  else if (brand.includes('honda')) profileParts.push('honda refined engine ivtec smooth reliable spacious sedan city amaze elevate bulletproof');
  else if (brand.includes('kia')) profileParts.push('kia stylish futuristic tech modern features loaded seltos sonet carens ev6 carnival design ventilated seats');
  else if (brand.includes('skoda')) profileParts.push('skoda german engineering solid european build handling driving dynamics kushaq slavia kylaq kodiaq turbo tsi punchy');
  else if (brand.includes('volkswagen')) profileParts.push('volkswagen german build quality 5 star safety handling precision virtus taigun tiguan tsi dsg high speed stability');
  else if (brand.includes('mg')) profileParts.push('mg feature loaded tech internet inside large touchscreen hector astor zs ev windsor comet panoramic sunroof spacious');
  else if (brand.includes('byd')) profileParts.push('byd advanced blade battery ev long range electric tech seal atto3 emax7 zero emissions ultra safe');
  else if (brand.includes('citroen')) profileParts.push('citroen supreme comfort flying carpet suspension soft ride basalt c3 aircross pothole absorber');
  else if (brand.includes('jeep')) profileParts.push('jeep true 4x4 trail rated offroad compass meridian wrangler robust solid');
  else if (brand.includes('force')) profileParts.push('force rugged 4x4 offroader differential locks snorkel gurkha tough go anywhere heavy duty');
  else if (brand.includes('bmw')) profileParts.push('bmw luxury driver car rear wheel drive sheer driving pleasure performance m sport x1 x3 3 series');
  else if (brand.includes('mercedes')) profileParts.push('mercedes benz luxury status comfort prestige amg limousine e class c class s class glc');
  else if (brand.includes('audi')) profileParts.push('audi luxury quattro all wheel drive matrix led technology sophisticated q3 q5 q7 a4 a6');
  else if (brand.includes('land rover')) profileParts.push('land rover luxury offroad defender range rover evoque terrain response status royalty');
  else if (brand.includes('volvo')) profileParts.push('volvo ultimate safety radar adas lidar luxury clean electric recharge xc40 xc60 ex40');
  else if (brand.includes('lexus')) profileParts.push('lexus luxury hybrid whisper quiet reliable takumi craftsmanship es300h rx');

  // 2. Body type implications
  const bodyType = (car.bodyType || '').toLowerCase();
  if (bodyType.includes('suv')) profileParts.push('suv high ground clearance rugged rough roads potholes water wading spacious presence commanding view');
  else if (bodyType.includes('sedan')) profileParts.push('sedan comfortable highway cruiser stable aerodynamic boot space luggage low body roll executive');
  else if (bodyType.includes('hatchback')) profileParts.push('hatchback compact city driving easy parking narrow lanes maneuverable commuter');
  else if (bodyType.includes('mpv') || bodyType.includes('muv')) profileParts.push('mpv muv family carrier spacious practical 6 7 8 seater captain seats road trips');

  // 3. Fuel type & variants implications
  const carFuel = (car.fuelType || '').toLowerCase();
  if (carFuel.includes('cng')) profileParts.push('cng economical low running cost cheap eco friendly green');
  if (carFuel.includes('diesel')) profileParts.push('diesel torque highway long distance punchy efficient pulling power');
  if (carFuel.includes('electric') || carFuel.includes('ev')) profileParts.push('electric ev zero emissions instant torque silent cheap running cost green fast charging');
  if (carFuel.includes('hybrid')) profileParts.push('hybrid self charging ultra efficient green quiet high mileage');
  if (carFuel.includes('petrol')) profileParts.push('petrol smooth refined quiet peppy responsive');

  // Extract fuel types and transmissions from variants
  if (car.variants && Array.isArray(car.variants)) {
    const fuels = new Set<string>();
    const trans = new Set<string>();
    const highlights = new Set<string>();

    for (const v of car.variants) {
      if (v.fuelType) fuels.add(v.fuelType.toLowerCase());
      if (v.transmission) trans.add(v.transmission.toLowerCase());
      if (Array.isArray(v.keyHighlights)) {
        v.keyHighlights.forEach((h: string) => highlights.add(h.toLowerCase()));
      }
    }

    if (fuels.has('cng')) profileParts.push('cng factory fitted cng kit economical');
    if (fuels.has('diesel')) profileParts.push('diesel torque highway punchy');
    if (fuels.has('electric')) profileParts.push('electric ev battery zero emissions');
    if (fuels.has('hybrid')) profileParts.push('hybrid strong hybrid e-cvt');
    if (trans.has('automatic')) profileParts.push('automatic amt cvt dsg dct dca torque converter paddle shifters traffic ease');
    if (trans.has('manual')) profileParts.push('manual 5 speed 6 speed stick shift control');

    profileParts.push(Array.from(highlights).join(' '));
  }

  // 4. Segment & Price positioning
  const price = car.priceRange?.min ?? car.priceMin ?? car.price ?? car.exShowroomPrice ?? 0;
  if (price > 0 && price < 700000) profileParts.push('budget affordable entry level cheap first time buyer value');
  else if (price >= 700000 && price < 1500000) profileParts.push('mid range value for money practical family upgrade');
  else if (price >= 1500000 && price < 3000000) profileParts.push('premium loaded aspirational executive features luxury');
  else if (price >= 3000000) profileParts.push('ultra luxury premium status symbol high end imported flagship');

  // 5. Performance tier
  let power = 0;
  if (typeof car.power === 'string') {
    const m = car.power.match(/(\d+(?:\.\d+)?)/);
    if (m) power = parseFloat(m[1]);
  } else if (typeof car.power === 'number') {
    power = car.power;
  }
  if (power > 0 && power < 75) profileParts.push('city commuter basic power adequate easy driving');
  else if (power >= 75 && power < 125) profileParts.push('balanced performance sufficient peppy city and highway');
  else if (power >= 125 && power < 200) profileParts.push('powerful fast enthusiastic fun to drive punchy overtaking');
  else if (power >= 200) profileParts.push('high performance thrilling fast quick supercar sports speed');

  // 6. Pros, Cons & Tags
  if (car.prosAndCons?.pros && Array.isArray(car.prosAndCons.pros)) profileParts.push(car.prosAndCons.pros.join(' '));
  if (car.prosAndCons?.cons && Array.isArray(car.prosAndCons.cons)) profileParts.push(car.prosAndCons.cons.join(' '));
  if (car.pros && Array.isArray(car.pros)) profileParts.push(car.pros.join(' '));
  if (car.cons && Array.isArray(car.cons)) profileParts.push(car.cons.join(' '));
  if (car.tags && Array.isArray(car.tags)) profileParts.push(car.tags.join(' '));

  // 7. Mileage descriptors
  let mileage = 0;
  if (typeof car.mileage === 'string') {
    const m = car.mileage.match(/(\d+(?:\.\d+)?)/);
    if (m) mileage = parseFloat(m[1]);
  } else if (typeof car.mileage === 'number') {
    mileage = car.mileage;
  }
  if (mileage >= 22) profileParts.push('exceptional mileage high fuel efficiency ultra frugal saving');
  else if (mileage >= 17) profileParts.push('good mileage fuel efficient economical');
  else if (mileage > 0 && mileage < 12) profileParts.push('thirsty high fuel consumption powerful heavy');

  // 8. Seating capacity
  const seating = car.seatingCapacity || car.seats || 5;
  if (seating === 2) profileParts.push('two seater sports couple');
  else if (seating <= 5) profileParts.push('five seater small family nuclear family');
  else if (seating >= 6) profileParts.push('large family 6 7 8 seater joint family group travel three rows');

  // 9. General identifiers
  profileParts.push(car.name || '');
  profileParts.push(car.segment || '');
  profileParts.push(car.description || '');

  return profileParts.join(' ');
}

class TfIdfVectorizer {
  private idf: Map<string, number> = new Map();
  private vocab: Set<string> = new Set();
  private numDocs: number = 0;

  fit(documents: string[]) {
    this.numDocs = documents.length;
    const docFreq: Map<string, number> = new Map();

    for (const doc of documents) {
      const tokens = tokenize(doc);
      const uniqueTokens = new Set(tokens);
      for (const token of uniqueTokens) {
        this.vocab.add(token);
        docFreq.set(token, (docFreq.get(token) || 0) + 1);
      }
    }

    for (const [token, df] of docFreq.entries()) {
      // standard IDF: log(N / df)
      this.idf.set(token, Math.log(this.numDocs / df));
    }
  }

  transform(text: string): Map<string, number> {
    const tokens = tokenize(text);
    const tfMap: Map<string, number> = new Map();
    
    // Calculate TF
    for (const token of tokens) {
      tfMap.set(token, (tfMap.get(token) || 0) + 1);
    }

    const vector: Map<string, number> = new Map();
    for (const [token, count] of tfMap.entries()) {
      if (this.idf.has(token)) {
        const idf = this.idf.get(token)!;
        vector.set(token, count * idf); // tf * idf
      }
    }

    return vector;
  }
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [token, val] of a.entries()) {
    normA += val * val;
    if (b.has(token)) {
      dotProduct += val * b.get(token)!;
    }
  }

  for (const val of b.values()) {
    normB += val * val;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * SemanticSearchEngine builds profiles and searches via TF-IDF cosine similarity.
 */
export class SemanticSearchEngine {
  private cars: any[];
  private vectorizer: TfIdfVectorizer;
  private carVectors: Map<any, Map<string, number>> = new Map();

  constructor(cars: any[]) {
    this.cars = cars;
    this.vectorizer = new TfIdfVectorizer();
    
    const profiles = cars.map(car => buildCarProfile(car));
    this.vectorizer.fit(profiles);

    for (let i = 0; i < cars.length; i++) {
      this.carVectors.set(cars[i], this.vectorizer.transform(profiles[i]));
    }
  }

  search(query: string, topK: number = 5): { car: any, score: number }[] {
    const queryVector = this.vectorizer.transform(query);
    const results: { car: any, score: number }[] = [];

    for (const car of this.cars) {
      const carVector = this.carVectors.get(car)!;
      const score = cosineSimilarity(queryVector, carVector);
      results.push({ car, score });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }
}
