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
 * Converts a car object into a rich text profile.
 */
export function buildCarProfile(car: any): string {
  const profileParts: string[] = [];

  // Brand reputation
  const brand = (car.make || car.brand || '').toLowerCase();
  if (brand.includes('tata')) profileParts.push('tata safety crash tested strong build');
  else if (brand.includes('maruti')) profileParts.push('maruti suzuki reliable low maintenance vast service network mileage');
  else if (brand.includes('hyundai')) profileParts.push('hyundai features premium smooth comfortable');
  else if (brand.includes('mahindra')) profileParts.push('mahindra rugged suv tough reliable diesel');
  else if (brand.includes('toyota')) profileParts.push('toyota reliable long lasting bulletproof engine');
  else if (brand.includes('honda')) profileParts.push('honda refined engine ivtec smooth reliable');

  // Body type implications
  const bodyType = (car.bodyType || '').toLowerCase();
  if (bodyType.includes('suv')) profileParts.push('suv high ground clearance rugged rough roads spacious presence');
  else if (bodyType.includes('sedan')) profileParts.push('sedan comfortable highway cruiser stable aerodynamic boot space');
  else if (bodyType.includes('hatchback')) profileParts.push('hatchback compact city driving easy parking maneuverable');
  else if (bodyType.includes('mpv') || bodyType.includes('muv')) profileParts.push('mpv family carrier spacious practical 7 seater');

  // Fuel type implications
  const fuelType = (car.fuelType || '').toLowerCase();
  if (fuelType.includes('cng')) profileParts.push('cng economical low running cost cheap eco friendly');
  else if (fuelType.includes('diesel')) profileParts.push('diesel torque highway long distance punchy efficient');
  else if (fuelType.includes('electric') || fuelType.includes('ev')) profileParts.push('electric zero emissions instant torque silent cheap running cost green');
  else if (fuelType.includes('petrol')) profileParts.push('petrol smooth refined quiet peppy');

  // Segment positioning
  const price = car.price || car.exShowroomPrice || 0;
  if (price > 0 && price < 700000) profileParts.push('budget affordable entry level cheap');
  else if (price >= 700000 && price < 1500000) profileParts.push('mid range value for money practical');
  else if (price >= 1500000 && price < 3000000) profileParts.push('premium loaded aspiration');
  else if (price >= 3000000) profileParts.push('premium luxury features loaded status symbol');

  // Performance tier
  const power = car.power || car.bhp || 0;
  if (power > 0 && power < 75) profileParts.push('city commuter basic power adequate');
  else if (power >= 75 && power < 120) profileParts.push('balanced performance sufficient');
  else if (power >= 120 && power < 200) profileParts.push('powerful fast enthusiastic fun to drive');
  else if (power >= 200) profileParts.push('performance fast thrilling quick');

  // Feature keywords
  if (car.pros) profileParts.push(car.pros.join(' '));
  if (car.cons) profileParts.push(car.cons.join(' '));
  if (car.features) profileParts.push(car.features.join(' '));

  // Mileage descriptors
  const mileage = car.mileage || car.fuelEfficiency || 0;
  if (mileage > 20) profileParts.push('high mileage fuel efficient economical frugal');
  else if (mileage < 12) profileParts.push('low mileage gas guzzler thirsty');

  // Seating capacity
  const seating = car.seatingCapacity || car.seats || 5;
  if (seating === 2) profileParts.push('two seater sports couple');
  if (seating <= 5) profileParts.push('five seater small family');
  if (seating >= 6) profileParts.push('large family 6 7 8 seater group travel');

  // General fields
  profileParts.push(car.name || '');
  profileParts.push(car.variant || '');
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
