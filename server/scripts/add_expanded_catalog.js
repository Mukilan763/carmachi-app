const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, '..', 'data', 'cars.json');
let cars = JSON.parse(fs.readFileSync(carsPath, 'utf8'));

const newCars = [
  {
    id: "maruti-dzire-2025",
    name: "Maruti Suzuki Dzire (4th Gen)",
    brand: "Maruti Suzuki",
    bodyType: "Sedan",
    segment: "Compact Sedan",
    priceRange: { min: 679000, max: 1014000 },
    launchYear: 2024,
    seatingCapacity: 5,
    overallRating: 4.8,
    totalReviews: 1450,
    images: [
      { url: "https://media.zigcdn.com/media/model/2024/Nov/dzire-front_600x400.jpg", alt: "Maruti Suzuki Dzire 2024 Exterior", type: "exterior" }
    ],
    power: "82bhp@5700rpm",
    torque: "112Nm@4300rpm",
    mileage: "25.71 Kmpl",
    engineCC: 1197,
    dimensions: { length: 3995, width: 1735, height: 1525, wheelbase: 2450 },
    prosAndCons: {
      pros: ["First Maruti with 5-star GNCAP adult and child safety rating", "Class-best fuel efficiency of 25.71 kmpl (petrol) and 33.73 km/kg (CNG)", "Segment-first electric sunroof and 360-degree camera"],
      cons: ["New 3-cylinder Z-series engine lacks high-rpm punch of old 4-cylinder K12", "Under-thigh support in rear seats could be slightly better"]
    },
    description: "The 4th generation Maruti Dzire is India's most popular compact sedan, featuring a bold new design, 5-star GNCAP safety rating, electric sunroof, and class-leading mileage.",
    variants: [
      { id: "dzire-lxi", name: "LXi", engine: "1197 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 679000, power: "82bhp@5700rpm", torque: "112Nm@4300rpm", mileage: "25.71 Kmpl", keyHighlights: ["6 Airbags Standard", "ESP with Hill Hold", "ABS with EBD", "Rear Parking Sensors"] },
      { id: "dzire-vxi", name: "VXi", engine: "1197 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 779000, power: "82bhp@5700rpm", torque: "112Nm@4300rpm", mileage: "25.71 Kmpl", keyHighlights: ["7-inch Touchscreen", "Rear AC Vents", "6 Airbags", "Steering Mounted Controls"] },
      { id: "dzire-vxi-cng", name: "VXi CNG", engine: "1197 cc", fuelType: "CNG", transmission: "Manual", priceExShowroom: 874000, power: "70bhp@5700rpm", torque: "102Nm@4300rpm", mileage: "33.73 km/kg", keyHighlights: ["Factory-fitted CNG Kit", "7-inch Touchscreen", "6 Airbags", "Rear AC Vents"] },
      { id: "dzire-vxi-ags", name: "VXi AGS", engine: "1197 cc", fuelType: "Petrol", transmission: "Automatic", priceExShowroom: 824000, power: "82bhp@5700rpm", torque: "112Nm@4300rpm", mileage: "25.71 Kmpl", keyHighlights: ["AMT Gearbox", "7-inch Touchscreen", "6 Airbags", "Hill Hold Assist"] },
      { id: "dzire-zxi", name: "ZXi", engine: "1197 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 889000, power: "82bhp@5700rpm", torque: "112Nm@4300rpm", mileage: "25.71 Kmpl", keyHighlights: ["Electric Sunroof", "Wireless Phone Charger", "Alloy Wheels", "6 Airbags"] },
      { id: "dzire-zxi-cng", name: "ZXi CNG", engine: "1197 cc", fuelType: "CNG", transmission: "Manual", priceExShowroom: 984000, power: "70bhp@5700rpm", torque: "102Nm@4300rpm", mileage: "33.73 km/kg", keyHighlights: ["Electric Sunroof", "Factory-fitted CNG Kit", "Alloy Wheels", "Wireless Phone Charger"] },
      { id: "dzire-zxi-plus", name: "ZXi Plus", engine: "1197 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 969000, power: "82bhp@5700rpm", torque: "112Nm@4300rpm", mileage: "25.71 Kmpl", keyHighlights: ["Electric Sunroof", "360-Degree Camera", "9-inch Touchscreen", "Cruiser Control"] },
      { id: "dzire-zxi-plus-ags", name: "ZXi Plus AGS", engine: "1197 cc", fuelType: "Petrol", transmission: "Automatic", priceExShowroom: 1014000, power: "82bhp@5700rpm", torque: "112Nm@4300rpm", mileage: "25.71 Kmpl", keyHighlights: ["Electric Sunroof", "360-Degree Camera", "9-inch Touchscreen", "AMT Automatic"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "skoda-kylaq",
    name: "Skoda Kylaq",
    brand: "Skoda",
    bodyType: "SUV",
    segment: "Compact SUV",
    priceRange: { min: 789000, max: 1440000 },
    launchYear: 2024,
    seatingCapacity: 5,
    overallRating: 4.7,
    totalReviews: 890,
    images: [
      { url: "https://media.zigcdn.com/media/model/2024/Nov/skoda-kylaq_600x400.jpg", alt: "Skoda Kylaq Compact SUV", type: "exterior" }
    ],
    power: "115bhp@5000rpm",
    torque: "178Nm@1750rpm",
    mileage: "19.65 Kmpl",
    engineCC: 999,
    dimensions: { length: 3995, width: 1783, height: 1619, wheelbase: 2566 },
    prosAndCons: {
      pros: ["Solid European MQB-A0-IN chassis with high crash safety", "Punchy 1.0 TSI turbo engine with 178 Nm torque", "Class-leading 446-litre boot space and 189mm ground clearance"],
      cons: ["No diesel or CNG powertrain option", "Rear seat best suited for two adults and a child rather than 3 adults"]
    },
    description: "Skoda Kylaq is a sub-4m European compact SUV powered by an energetic 1.0-litre TSI turbo-petrol engine, boasting 6 airbags standard and superior ride dynamics.",
    variants: [
      { id: "kylaq-classic", name: "Classic", engine: "999 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 789000, power: "115bhp@5000rpm", torque: "178Nm@1750rpm", mileage: "19.65 Kmpl", keyHighlights: ["6 Airbags Standard", "ESC with Multi Collision Braking", "Front Power Windows", "ISOFIX Child Mounts"] },
      { id: "kylaq-signature", name: "Signature", engine: "999 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 959000, power: "115bhp@5000rpm", torque: "178Nm@1750rpm", mileage: "19.65 Kmpl", keyHighlights: ["8-inch Touchscreen", "Automatic Climate Control", "Alloy Wheels", "6 Airbags"] },
      { id: "kylaq-signature-at", name: "Signature AT", engine: "999 cc", fuelType: "Petrol", transmission: "Automatic", priceExShowroom: 1059000, power: "115bhp@5000rpm", torque: "178Nm@1750rpm", mileage: "18.80 Kmpl", keyHighlights: ["6-Speed Torque Converter AT", "8-inch Touchscreen", "Paddle Shifters", "Alloy Wheels"] },
      { id: "kylaq-prestige", name: "Prestige", engine: "999 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 1335000, power: "115bhp@5000rpm", torque: "178Nm@1750rpm", mileage: "19.65 Kmpl", keyHighlights: ["Electric Sunroof", "Ventilated Front Seats", "10-inch Touchscreen", "Wireless Phone Charging"] },
      { id: "kylaq-prestige-at", name: "Prestige AT", engine: "999 cc", fuelType: "Petrol", transmission: "Automatic", priceExShowroom: 1440000, power: "115bhp@5000rpm", torque: "178Nm@1750rpm", mileage: "18.80 Kmpl", keyHighlights: ["Electric Sunroof", "Ventilated Front Seats", "6-Speed Automatic", "10-inch Touchscreen"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "mahindra-scorpio-classic",
    name: "Mahindra Scorpio Classic",
    brand: "Mahindra",
    bodyType: "SUV",
    segment: "Mid-size SUV",
    priceRange: { min: 1362000, max: 1742000 },
    launchYear: 2022,
    seatingCapacity: 7,
    overallRating: 4.6,
    totalReviews: 3200,
    images: [
      { url: "https://media.zigcdn.com/media/model/2022/Aug/scorpio-classic_600x400.jpg", alt: "Mahindra Scorpio Classic SUV", type: "exterior" }
    ],
    power: "132bhp@3750rpm",
    torque: "300Nm@1600rpm",
    mileage: "15.0 Kmpl",
    engineCC: 2184,
    dimensions: { length: 4456, width: 1820, height: 1995, wheelbase: 2680 },
    prosAndCons: {
      pros: ["Commanding high driving position and unmatched rugged road presence", "Punchy second-gen 2.2L mHawk diesel engine with 300 Nm low-end torque", "Heavy-duty ladder frame chassis built for abuse on broken rural roads"],
      cons: ["Body roll around sharp highway corners", "Lacks modern safety tech like ADAS, curtain airbags, or 360 camera"]
    },
    description: "The Mahindra Scorpio Classic carries forward the iconic Indian SUV legacy with an updated all-aluminium mHawk diesel engine, cable shift 6-speed manual, and tough ladder-frame construction.",
    variants: [
      { id: "scorpio-classic-s", name: "S", engine: "2184 cc", fuelType: "Diesel", transmission: "Manual", priceExShowroom: 1362000, power: "132bhp@3750rpm", torque: "300Nm@1600rpm", mileage: "15.0 Kmpl", keyHighlights: ["Dual Airbags", "Rear Parking Sensors", "ABS with EBD", "AC with Rear Vents"] },
      { id: "scorpio-classic-s11", name: "S11", engine: "2184 cc", fuelType: "Diesel", transmission: "Manual", priceExShowroom: 1742000, power: "132bhp@3750rpm", torque: "300Nm@1600rpm", mileage: "15.0 Kmpl", keyHighlights: ["9-inch Touchscreen", "17-inch Diamond Cut Alloys", "Projector Headlamps", "Automatic Climate Control"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "citroen-basalt",
    name: "Citroen Basalt",
    brand: "Citroen",
    bodyType: "SUV",
    segment: "SUV Coupe",
    priceRange: { min: 799000, max: 1383000 },
    launchYear: 2024,
    seatingCapacity: 5,
    overallRating: 4.5,
    totalReviews: 610,
    images: [
      { url: "https://media.zigcdn.com/media/model/2024/Aug/citroen-basalt_600x400.jpg", alt: "Citroen Basalt SUV Coupe", type: "exterior" }
    ],
    power: "110bhp@5500rpm",
    torque: "205Nm@1750rpm",
    mileage: "19.5 Kmpl",
    engineCC: 1199,
    dimensions: { length: 4352, width: 1765, height: 1593, wheelbase: 2651 },
    prosAndCons: {
      pros: ["Striking SUV-coupe silhouette at an affordable price point", "Plush 'Flying Carpet' suspension absorption over potholes", "Segment-unique adjustable rear seat under-thigh support"],
      cons: ["Basic feature omissions like sunroof, ventilated seats, and cruise control", "Limited dealership network in Tier 2 and Tier 3 cities"]
    },
    description: "Citroen Basalt combines distinctive coupe styling with SUV ground clearance and superior suspension comfort, making it a head-turner on Indian roads.",
    variants: [
      { id: "basalt-you", name: "You 1.2 NA", engine: "1199 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 799000, power: "82bhp@5750rpm", torque: "115Nm@3750rpm", mileage: "18.0 Kmpl", keyHighlights: ["6 Airbags Standard", "ESP with Hill Hold", "ABS with EBD", "Rear Parking Sensors"] },
      { id: "basalt-plus-turbo", name: "Plus 1.2 Turbo", engine: "1199 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 1149000, power: "110bhp@5500rpm", torque: "190Nm@1750rpm", mileage: "19.5 Kmpl", keyHighlights: ["10.25-inch Touchscreen", "Wireless Apple CarPlay/Android Auto", "6 Airbags", "Reverse Camera"] },
      { id: "basalt-max-turbo-at", name: "Max 1.2 Turbo AT", engine: "1199 cc", fuelType: "Petrol", transmission: "Automatic", priceExShowroom: 1383000, power: "110bhp@5500rpm", torque: "205Nm@1750rpm", mileage: "18.7 Kmpl", keyHighlights: ["6-Speed Aisin Torque Converter AT", "Wireless Phone Charger", "Alloy Wheels", "LED Projector Headlamps"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "hyundai-venue-n-line",
    name: "Hyundai Venue N Line",
    brand: "Hyundai",
    bodyType: "SUV",
    segment: "Performance Compact SUV",
    priceRange: { min: 1208000, max: 1390000 },
    launchYear: 2023,
    seatingCapacity: 5,
    overallRating: 4.6,
    totalReviews: 940,
    images: [
      { url: "https://media.zigcdn.com/media/model/2022/Sep/venue-nline-right-front-three-quarter_600x400.jpg", alt: "Hyundai Venue N Line", type: "exterior" }
    ],
    power: "120bhp@6000rpm",
    torque: "172Nm@1500rpm",
    mileage: "18.3 Kmpl",
    engineCC: 998,
    dimensions: { length: 3995, width: 1770, height: 1617, wheelbase: 2500 },
    prosAndCons: {
      pros: ["Stiffened sports suspension and quicker steering response", "Throaty twin-tip sports exhaust sound", "4-wheel disc brakes for confident high-speed stopping"],
      cons: ["Stiffer ride quality over broken city tarmac", "DCT transmission can heat up in severe stop-and-go bumper traffic"]
    },
    description: "Hyundai Venue N Line is a motorsport-inspired compact SUV engineered with dual exhaust tips, all-4 disc brakes, paddle shifters, and red track-inspired aesthetic accents.",
    variants: [
      { id: "venue-nline-n6", name: "N6 MT", engine: "998 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 1208000, power: "120bhp@6000rpm", torque: "172Nm@1500rpm", mileage: "18.3 Kmpl", keyHighlights: ["Twin Exhaust Tips", "All 4 Disc Brakes", "8-inch Touchscreen", "6 Airbags"] },
      { id: "venue-nline-n6-dct", name: "N6 DCT", engine: "998 cc", fuelType: "Petrol", transmission: "Automatic", priceExShowroom: 1285000, power: "120bhp@6000rpm", torque: "172Nm@1500rpm", mileage: "18.3 Kmpl", keyHighlights: ["7-Speed Dual Clutch DCT", "Paddle Shifters", "Drive Modes", "Twin Exhaust"] },
      { id: "venue-nline-n8-dct", name: "N8 DCT", engine: "998 cc", fuelType: "Petrol", transmission: "Automatic", priceExShowroom: 1390000, power: "120bhp@6000rpm", torque: "172Nm@1500rpm", mileage: "18.3 Kmpl", keyHighlights: ["ADAS Level 1", "Dashcam with Dual Camera", "Electric Sunroof", "Bose Sound System"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "tata-altroz-racer",
    name: "Tata Altroz Racer",
    brand: "Tata",
    bodyType: "Hatchback",
    segment: "Performance Hatchback",
    priceRange: { min: 949000, max: 1099000 },
    launchYear: 2024,
    seatingCapacity: 5,
    overallRating: 4.7,
    totalReviews: 780,
    images: [
      { url: "https://media.zigcdn.com/media/model/2024/Jun/tata-altroz-racer_600x400.jpg", alt: "Tata Altroz Racer Hot Hatch", type: "exterior" }
    ],
    power: "120bhp@5500rpm",
    torque: "170Nm@1750rpm",
    mileage: "18.0 Kmpl",
    engineCC: 1199,
    dimensions: { length: 3990, width: 1755, height: 1523, wheelbase: 2501 },
    prosAndCons: {
      pros: ["Punchy 120 PS turbocharged engine mated to a slick 6-speed manual", "First hatchback in India to offer ventilated front seats and 360-degree camera", "Solid 5-star Global NCAP crash safety certification"],
      cons: ["No automatic transmission available at launch", "Racy dual stripes and aggressive dual-tone styling may polarize conservative buyers"]
    },
    description: "Tata Altroz Racer is India's most feature-packed hot hatchback, bringing Nexon's 120 PS turbo engine, 6-speed manual gearbox, ventilated leatherette seats, and 360-degree camera to the hatchback segment.",
    variants: [
      { id: "altroz-racer-r1", name: "R1", engine: "1199 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 949000, power: "120bhp@5500rpm", torque: "170Nm@1750rpm", mileage: "18.0 Kmpl", keyHighlights: ["6 Airbags", "10.25-inch Touchscreen", "Leatherette Seats", "ESC with Hill Hold"] },
      { id: "altroz-racer-r2", name: "R2", engine: "1199 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 1049000, power: "120bhp@5500rpm", torque: "170Nm@1750rpm", mileage: "18.0 Kmpl", keyHighlights: ["Electric Voice Sunroof", "360-Degree Camera", "Blind Spot Monitor", "Wireless Charger"] },
      { id: "altroz-racer-r3", name: "R3", engine: "1199 cc", fuelType: "Petrol", transmission: "Manual", priceExShowroom: 1099000, power: "120bhp@5500rpm", torque: "170Nm@1750rpm", mileage: "18.0 Kmpl", keyHighlights: ["Ventilated Front Seats", "Air Purifier", "iRA Connected Tech", "360-Degree Camera"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "byd-seal",
    name: "BYD Seal",
    brand: "BYD",
    bodyType: "Sedan",
    segment: "Luxury Electric Sports Sedan",
    priceRange: { min: 4100000, max: 5300000 },
    launchYear: 2024,
    seatingCapacity: 5,
    overallRating: 4.9,
    totalReviews: 530,
    images: [
      { url: "https://media.zigcdn.com/media/model/2024/Mar/byd-seal_600x400.jpg", alt: "BYD Seal Electric Sedan", type: "exterior" }
    ],
    power: "530bhp@6000rpm",
    torque: "670Nm@0rpm",
    mileage: "650 km/charge",
    engineCC: 0,
    dimensions: { length: 4800, width: 1875, height: 1460, wheelbase: 2920 },
    prosAndCons: {
      pros: ["Supercar-slaying 0-100 km/h acceleration in 3.8 seconds on AWD variant", "Ultra-safe 82.56 kWh LFP Blade Battery with 650 km range", "High-tech rotating 15.6-inch touchscreen and 5-star Euro NCAP rating"],
      cons: ["Low 145mm ground clearance requires caution on big Indian speed breakers", "BYD brand service network is concentrated mostly in metro cities"]
    },
    description: "The BYD Seal is an ultra-aerodynamic electric sports sedan that redefines luxury EV performance with Cell-to-Body technology, 530 PS dual-motor power, and high-voltage fast charging.",
    variants: [
      { id: "seal-dynamic", name: "Dynamic Range", engine: "61.44 kWh Battery", fuelType: "Electric", transmission: "Automatic", priceExShowroom: 4100000, power: "204bhp", torque: "310Nm", mileage: "510 km/charge", keyHighlights: ["Rotating 15.6-inch Screen", "ADAS Level 2", "Ventilated Seats", "Crystal Gear Shifter"] },
      { id: "seal-premium", name: "Premium Range", engine: "82.56 kWh Battery", fuelType: "Electric", transmission: "Automatic", priceExShowroom: 4555000, power: "313bhp", torque: "360Nm", mileage: "650 km/charge", keyHighlights: ["Long Range 82.5kWh", "Heads Up Display (HUD)", "Genuine Leather Seats", "ADAS Level 2"] },
      { id: "seal-performance", name: "Performance AWD", engine: "82.56 kWh Battery", fuelType: "Electric", transmission: "Automatic", priceExShowroom: 5300000, power: "530bhp", torque: "670Nm", mileage: "580 km/charge", keyHighlights: ["Dual Motor AWD (0-100 in 3.8s)", "Frequency Selective Dampers", "Heated Steering", "530 PS Power"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "byd-emax-7",
    name: "BYD eMAX 7",
    brand: "BYD",
    bodyType: "MUV",
    segment: "Electric MPV",
    priceRange: { min: 2690000, max: 2990000 },
    launchYear: 2024,
    seatingCapacity: 7,
    overallRating: 4.7,
    totalReviews: 320,
    images: [
      { url: "https://media.zigcdn.com/media/model/2024/Oct/byd-emax-7_600x400.jpg", alt: "BYD eMAX 7 Electric MPV", type: "exterior" }
    ],
    power: "204bhp",
    torque: "310Nm",
    mileage: "530 km/charge",
    engineCC: 0,
    dimensions: { length: 4710, width: 1810, height: 1690, wheelbase: 2800 },
    prosAndCons: {
      pros: ["Zero running emissions with spacious 6 and 7-seater configurations", "Proven Blade Battery chemistry with up to 530 km certified range", "Smooth instant electric torque makes city driving effortless with full family"],
      cons: ["No spare wheel provided in the boot", "Fixed panoramic glass roof cannot be opened"]
    },
    description: "The BYD eMAX 7 is an all-electric 6 and 7-seater family MPV equipped with advanced LFP Blade Battery technology, Level 2 ADAS, and luxury executive captain seating.",
    variants: [
      { id: "emax7-premium-7s", name: "Premium 7-Seater", engine: "55.4 kWh Battery", fuelType: "Electric", transmission: "Automatic", priceExShowroom: 2690000, power: "163bhp", torque: "310Nm", mileage: "420 km/charge", keyHighlights: ["7-Seater Layout", "12.8-inch Rotating Touchscreen", "6 Airbags", "V2L Function"] },
      { id: "emax7-superior-6s", name: "Superior 6-Seater", engine: "71.8 kWh Battery", fuelType: "Electric", transmission: "Automatic", priceExShowroom: 2990000, power: "204bhp", torque: "310Nm", mileage: "530 km/charge", keyHighlights: ["Captain Seats 2nd Row", "Panoramic Glass Roof", "ADAS Level 2", "Powered Tailgate"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "force-gurkha-5-door",
    name: "Force Gurkha 5-Door",
    brand: "Force",
    bodyType: "SUV",
    segment: "Extreme 4x4 Off-roader",
    priceRange: { min: 1800000, max: 1925000 },
    launchYear: 2024,
    seatingCapacity: 7,
    overallRating: 4.6,
    totalReviews: 410,
    images: [
      { url: "https://media.zigcdn.com/media/model/2024/Apr/force-gurkha-5-door_600x400.jpg", alt: "Force Gurkha 5-Door 4x4", type: "exterior" }
    ],
    power: "140bhp@3200rpm",
    torque: "320Nm@1400rpm",
    mileage: "12.0 Kmpl",
    engineCC: 2596,
    dimensions: { length: 4390, width: 1865, height: 2095, wheelbase: 2825 },
    prosAndCons: {
      pros: ["Front AND rear mechanical differential locks with shift-on-the-fly 4WD", "Factory-fitted air intake snorkel with massive 700mm water wading depth", "3-row 7-seater layout with high roof commanding presence"],
      cons: ["Utilitarian cabin with industrial hard plastics", "Large 2.1-metre height won't fit inside some old apartment basement parking lots"]
    },
    description: "The Force Gurkha 5-door is a purist heavy-duty 4x4 built on Mercedes-derived mechanicals with locking differentials, 700mm water wading capacity, and true go-anywhere capability.",
    variants: [
      { id: "gurkha-5door-4x4", name: "5-Door 4x4 7-Seater", engine: "2596 cc", fuelType: "Diesel", transmission: "Manual", priceExShowroom: 1800000, power: "140bhp@3200rpm", torque: "320Nm@1400rpm", mileage: "12.0 Kmpl", keyHighlights: ["Front & Rear Diff Locks", "Factory Snorkel (700mm Wading)", "7-Seater 3-Row Seating", "Shift-on-Fly 4WD"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "jeep-wrangler-india",
    name: "Jeep Wrangler",
    brand: "Jeep",
    bodyType: "SUV",
    segment: "Luxury Iconic 4x4",
    priceRange: { min: 6765000, max: 7165000 },
    launchYear: 2024,
    seatingCapacity: 5,
    overallRating: 4.8,
    totalReviews: 890,
    images: [
      { url: "https://media.zigcdn.com/media/model/2024/Apr/jeep-wrangler_600x400.jpg", alt: "Jeep Wrangler Rubicon", type: "exterior" }
    ],
    power: "272bhp@5250rpm",
    torque: "400Nm@3000rpm",
    mileage: "11.4 Kmpl",
    engineCC: 1995,
    dimensions: { length: 4867, width: 1894, height: 1864, wheelbase: 3007 },
    prosAndCons: {
      pros: ["World-renowned off-road hardware with Dana 44 heavy duty axles and sway-bar disconnect", "Removable doors and hardtop for open-air freedom", "Massive iconic street presence and luxury brand cachet"],
      cons: ["Stiff, bouncy on-road ride quality over highway expansion joints", "High fuel consumption in city traffic"]
    },
    description: "The Jeep Wrangler is the pinnacle of American off-road heritage, offering Trail Rated capability, heavy-duty Dana solid axles, removable hardtop panels, and an authentic 4x4 soul.",
    variants: [
      { id: "wrangler-unlimited", name: "Unlimited", engine: "1995 cc", fuelType: "Petrol", transmission: "Automatic", priceExShowroom: 6765000, power: "272bhp@5250rpm", torque: "400Nm@3000rpm", mileage: "11.4 Kmpl", keyHighlights: ["Selec-Trac 4WD", "12.3-inch Touchscreen", "Alpine 9-Speaker Audio", "Removable Doors"] },
      { id: "wrangler-rubicon", name: "Rubicon", engine: "1995 cc", fuelType: "Petrol", transmission: "Automatic", priceExShowroom: 7165000, power: "272bhp@5250rpm", torque: "400Nm@3000rpm", mileage: "10.8 Kmpl", keyHighlights: ["Rock-Trac 4:1 Transfer Case", "Electronic Sway Bar Disconnect", "Dana 44 Heavy Duty Axles", "Tru-Lok Front/Rear Lockers"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "bmw-ix1",
    name: "BMW iX1",
    brand: "BMW",
    bodyType: "SUV",
    segment: "Luxury Electric SUV",
    priceRange: { min: 6690000, max: 6900000 },
    launchYear: 2023,
    seatingCapacity: 5,
    overallRating: 4.8,
    totalReviews: 360,
    images: [
      { url: "https://media.zigcdn.com/media/model/2023/Sep/bmw-ix1_600x400.jpg", alt: "BMW iX1 Electric SUV", type: "exterior" }
    ],
    power: "313bhp",
    torque: "494Nm",
    mileage: "440 km/charge",
    engineCC: 0,
    dimensions: { length: 4500, width: 1845, height: 1616, wheelbase: 2692 },
    prosAndCons: {
      pros: ["Sheer BMW driving dynamics with instant 494 Nm dual-motor electric thrust", "Sleek BMW Curved Display with OS 9 software", "Compact footprint perfect for maneuvering through metro luxury apartments"],
      cons: ["Firm suspension setup on bad roads", "Real-world highway range drops to around 340-360 km at high speeds"]
    },
    description: "The BMW iX1 is the German marque's most accessible electric SUV, boasting all-wheel-drive xDrive electric agility, 313 hp boost power, and sustainable premium cabin craftsmanship.",
    variants: [
      { id: "ix1-xdrive30", name: "xDrive30 M Sport", engine: "66.4 kWh Battery", fuelType: "Electric", transmission: "Automatic", priceExShowroom: 6690000, power: "313bhp", torque: "494Nm", mileage: "440 km/charge", keyHighlights: ["Dual Motor AWD", "BMW Curved Display", "Harman Kardon Sound", "Panoramic Glass Roof"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "mercedes-benz-e-class-lwb-2025",
    name: "Mercedes-Benz E-Class LWB",
    brand: "Mercedes-Benz",
    bodyType: "Sedan",
    segment: "Luxury Executive Sedan",
    priceRange: { min: 7850000, max: 9250000 },
    launchYear: 2024,
    seatingCapacity: 5,
    overallRating: 4.9,
    totalReviews: 480,
    images: [
      { url: "https://media.zigcdn.com/media/model/2024/Oct/mercedes-benz-e-class_600x400.jpg", alt: "Mercedes Benz E Class LWB 2025", type: "exterior" }
    ],
    power: "204bhp@5800rpm",
    torque: "320Nm@1600rpm",
    mileage: "16.5 Kmpl",
    engineCC: 1999,
    dimensions: { length: 5092, width: 1880, height: 1493, wheelbase: 3094 },
    prosAndCons: {
      pros: ["Class-leading rear legroom with 36-degree power reclining executive seats", "Futuristic MBUX Superscreen spanning three digital displays across the dash", "Unmatched prestige, isolation from road noise, and plush air suspension ride"],
      cons: ["Enormous 5.1-meter length requires planning for tight parking spots", "Touch-sensitive steering controls take getting used to"]
    },
    description: "The 6th generation Mercedes-Benz E-Class Long Wheelbase (V214) is the quintessential Indian chauffeur-driven luxury limousine, loaded with the MBUX Superscreen and rear recliner comfort.",
    variants: [
      { id: "e-class-e200", name: "E 200 LWB", engine: "1999 cc", fuelType: "Petrol", transmission: "Automatic", priceExShowroom: 7850000, power: "204bhp@5800rpm", torque: "320Nm@1600rpm", mileage: "16.5 Kmpl", keyHighlights: ["MBUX Superscreen", "Chauffeur Recliner Package", "Panoramic Sunroof", "Burmester 4D Audio"] },
      { id: "e-class-e220d", name: "E 220d LWB", engine: "1993 cc", fuelType: "Diesel", transmission: "Automatic", priceExShowroom: 8150000, power: "197bhp@3600rpm", torque: "440Nm@1800rpm", mileage: "18.2 Kmpl", keyHighlights: ["Mild Hybrid Diesel", "Chauffeur Recliner Package", "MBUX Superscreen", "Air Suspension"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "toyota-hilux",
    name: "Toyota Hilux",
    brand: "Toyota",
    bodyType: "SUV",
    segment: "Lifestyle 4x4 Truck",
    priceRange: { min: 3040000, max: 3790000 },
    launchYear: 2022,
    seatingCapacity: 5,
    overallRating: 4.8,
    totalReviews: 1100,
    images: [
      { url: "https://media.zigcdn.com/media/model/2022/Jan/hilux_600x400.jpg", alt: "Toyota Hilux 4x4 Pickup", type: "exterior" }
    ],
    power: "204bhp@3400rpm",
    torque: "500Nm@1600rpm",
    mileage: "13.5 Kmpl",
    engineCC: 2755,
    dimensions: { length: 5325, width: 1855, height: 1815, wheelbase: 3085 },
    prosAndCons: {
      pros: ["Legendary indestructible Toyota IMV ladder-frame platform", "Heavy-duty 4x4 with electronic rear diff lock and 700mm water wading", "Huge open cargo flatbed for camping, overland rigs, and motorcycles"],
      cons: ["Stiff leaf-spring rear suspension bounces when driven unladen without cargo", "Over 5.3 meters in length makes city U-turns cumbersome"]
    },
    description: "The Toyota Hilux is the world's most resilient pickup truck, powered by a bulletproof 2.8L diesel engine generating 500 Nm of torque with serious 4x4 overland credentials.",
    variants: [
      { id: "hilux-std-mt", name: "Standard 4x4 MT", engine: "2755 cc", fuelType: "Diesel", transmission: "Manual", priceExShowroom: 3040000, power: "204bhp", torque: "420Nm", mileage: "13.5 Kmpl", keyHighlights: ["4x4 Low Ratio", "Electronic Rear Diff Lock", "7 Airbags", "700mm Water Wading"] },
      { id: "hilux-high-at", name: "High 4x4 AT", engine: "2755 cc", fuelType: "Diesel", transmission: "Automatic", priceExShowroom: 3790000, power: "204bhp", torque: "500Nm", mileage: "13.0 Kmpl", keyHighlights: ["500Nm Torque", "6-Speed Automatic", "Leather Upholstery", "8-inch Touchscreen"] }
    ],
    scrapedAt: new Date().toISOString()
  },
  {
    id: "lexus-es-300h",
    name: "Lexus ES 300h",
    brand: "Lexus",
    bodyType: "Sedan",
    segment: "Luxury Self-Charging Hybrid",
    priceRange: { min: 6400000, max: 6970000 },
    launchYear: 2023,
    seatingCapacity: 5,
    overallRating: 4.8,
    totalReviews: 420,
    images: [
      { url: "https://media.zigcdn.com/media/model/2021/Oct/lexus-es_600x400.jpg", alt: "Lexus ES 300h Luxury Hybrid", type: "exterior" }
    ],
    power: "218bhp@5700rpm",
    torque: "221Nm@3600rpm",
    mileage: "22.58 Kmpl",
    engineCC: 2487,
    dimensions: { length: 4975, width: 1865, height: 1445, wheelbase: 2870 },
    prosAndCons: {
      pros: ["Incredible 22.58 kmpl fuel economy from self-charging strong hybrid powertrain", "Whisper-quiet acoustic glass cabin with peerless Japanese Takumi reliability", "Audiophile-grade Mark Levinson 17-speaker surround sound system"],
      cons: ["Front-wheel-drive dynamics lack the rear-wheel tail-happiness of BMW 3/5 Series", "CVT gearbox creates rubber-band effect during sudden aggressive kickdown"]
    },
    description: "The Lexus ES 300h is a self-charging strong-hybrid luxury saloon that combines serenity, ultra-low emissions, 22.58 kmpl efficiency, and legendary Japanese bulletproof durability.",
    variants: [
      { id: "lexus-es-exquisite", name: "Exquisite", engine: "2487 cc Hybrid", fuelType: "Hybrid", transmission: "Automatic", priceExShowroom: 6400000, power: "218bhp", torque: "221Nm", mileage: "22.58 Kmpl", keyHighlights: ["Self-Charging Hybrid", "E-CVT Automatic", "12.3-inch Screen", "10 Airbags"] },
      { id: "lexus-es-luxury", name: "Luxury", engine: "2487 cc Hybrid", fuelType: "Hybrid", transmission: "Automatic", priceExShowroom: 6970000, power: "218bhp", torque: "221Nm", mileage: "22.58 Kmpl", keyHighlights: ["Mark Levinson 17-Speaker Audio", "Semi-Aniline Leather", "Head-Up Display", "Handsfree Boot"] }
    ],
    scrapedAt: new Date().toISOString()
  }
];

let addedCount = 0;
for (const newCar of newCars) {
  const existingIdx = cars.findIndex(c => c.id === newCar.id || c.name.toLowerCase() === newCar.name.toLowerCase());
  if (existingIdx >= 0) {
    cars[existingIdx] = newCar;
    console.log(`[UPDATE] Updated existing car: ${newCar.name}`);
  } else {
    cars.push(newCar);
    addedCount++;
    console.log(`[INSERT] Added new car: ${newCar.name}`);
  }
}

console.log(`\nWriting updated dataset (${cars.length} cars) to cars.json...`);
fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2), 'utf8');
console.log(`✅ Success! Added ${addedCount} new cars. Total catalog count: ${cars.length}`);
