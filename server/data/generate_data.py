import json
import os
import random

DATA_DIR = r"d:\Automobile Antigravity\server\data"
os.makedirs(DATA_DIR, exist_ok=True)

models_data = [
    {"id": "maruti-alto-k10", "brand": "Maruti Suzuki", "name": "Alto K10", "type": "Hatchback", "segment": "Budget", "base_price": 399000, "variants": ["LXi", "VXi", "VXi+"]},
    {"id": "maruti-s-presso", "brand": "Maruti Suzuki", "name": "S-Presso", "type": "Hatchback", "segment": "Budget", "base_price": 426000, "variants": ["Std", "LXi", "VXi", "VXi+"]},
    {"id": "maruti-celerio", "brand": "Maruti Suzuki", "name": "Celerio", "type": "Hatchback", "segment": "Budget", "base_price": 536000, "variants": ["LXi", "VXi", "ZXi", "ZXi+"]},
    {"id": "maruti-wagonr", "brand": "Maruti Suzuki", "name": "Wagon R", "type": "Hatchback", "segment": "Budget", "base_price": 554000, "variants": ["LXi", "VXi", "ZXi", "ZXi+"]},
    {"id": "maruti-swift", "brand": "Maruti Suzuki", "name": "Swift", "type": "Hatchback", "segment": "Budget", "base_price": 599000, "variants": ["LXi", "VXi", "ZXi", "ZXi+"]},
    {"id": "maruti-baleno", "brand": "Maruti Suzuki", "name": "Baleno", "type": "Hatchback", "segment": "Premium Hatchback", "base_price": 666000, "variants": ["Sigma", "Delta", "Zeta", "Alpha"]},
    {"id": "maruti-dzire", "brand": "Maruti Suzuki", "name": "Dzire", "type": "Sedan", "segment": "Compact Sedan", "base_price": 656000, "variants": ["LXi", "VXi", "ZXi", "ZXi+"]},
    {"id": "maruti-ciaz", "brand": "Maruti Suzuki", "name": "Ciaz", "type": "Sedan", "segment": "Mid-size Sedan", "base_price": 940000, "variants": ["Sigma", "Delta", "Zeta", "Alpha"]},
    {"id": "maruti-fronx", "brand": "Maruti Suzuki", "name": "Fronx", "type": "SUV", "segment": "Compact SUV", "base_price": 751000, "variants": ["Sigma", "Delta", "Zeta", "Alpha"]},
    {"id": "maruti-brezza", "brand": "Maruti Suzuki", "name": "Brezza", "type": "SUV", "segment": "Compact SUV", "base_price": 834000, "variants": ["LXi", "VXi", "ZXi", "ZXi+"]},
    {"id": "maruti-grand-vitara", "brand": "Maruti Suzuki", "name": "Grand Vitara", "type": "SUV", "segment": "Mid-size SUV", "base_price": 1080000, "variants": ["Sigma", "Delta", "Zeta", "Alpha"]},
    {"id": "maruti-ertiga", "brand": "Maruti Suzuki", "name": "Ertiga", "type": "MUV", "segment": "MPV", "base_price": 869000, "variants": ["LXi", "VXi", "ZXi", "ZXi+"]},
    {"id": "maruti-xl6", "brand": "Maruti Suzuki", "name": "XL6", "type": "MUV", "segment": "Premium MPV", "base_price": 1161000, "variants": ["Zeta", "Alpha", "Alpha+"]},
    {"id": "maruti-jimny", "brand": "Maruti Suzuki", "name": "Jimny", "type": "SUV", "segment": "Off-road SUV", "base_price": 1274000, "variants": ["Zeta", "Alpha"]},
    {"id": "maruti-invicto", "brand": "Maruti Suzuki", "name": "Invicto", "type": "MUV", "segment": "Premium MPV", "base_price": 2521000, "variants": ["Zeta+", "Alpha+"]},
    
    {"id": "hyundai-grand-i10-nios", "brand": "Hyundai", "name": "Grand i10 Nios", "type": "Hatchback", "segment": "Budget", "base_price": 592000, "variants": ["Era", "Magna", "Sportz", "Asta"]},
    {"id": "hyundai-i20", "brand": "Hyundai", "name": "i20", "type": "Hatchback", "segment": "Premium Hatchback", "base_price": 704000, "variants": ["Era", "Magna", "Sportz", "Asta", "Asta (O)"]},
    {"id": "hyundai-aura", "brand": "Hyundai", "name": "Aura", "type": "Sedan", "segment": "Compact Sedan", "base_price": 649000, "variants": ["E", "S", "SX", "SX (O)"]},
    {"id": "hyundai-verna", "brand": "Hyundai", "name": "Verna", "type": "Sedan", "segment": "Mid-size Sedan", "base_price": 1100000, "variants": ["EX", "S", "SX", "SX (O)"]},
    {"id": "hyundai-venue", "brand": "Hyundai", "name": "Venue", "type": "SUV", "segment": "Compact SUV", "base_price": 794000, "variants": ["E", "S", "S (O)", "SX", "SX (O)"]},
    {"id": "hyundai-creta", "brand": "Hyundai", "name": "Creta", "type": "SUV", "segment": "Mid-size SUV", "base_price": 1100000, "variants": ["E", "EX", "S", "SX", "SX (O)"]},
    {"id": "hyundai-alcazar", "brand": "Hyundai", "name": "Alcazar", "type": "SUV", "segment": "Mid-size SUV", "base_price": 1677000, "variants": ["Prestige", "Platinum", "Signature"]},
    {"id": "hyundai-tucson", "brand": "Hyundai", "name": "Tucson", "type": "SUV", "segment": "Premium SUV", "base_price": 2901000, "variants": ["Platinum", "Signature"]},
    {"id": "hyundai-exter", "brand": "Hyundai", "name": "Exter", "type": "SUV", "segment": "Micro SUV", "base_price": 612000, "variants": ["EX", "S", "SX", "SX (O)"]},
    
    {"id": "tata-tiago", "brand": "Tata", "name": "Tiago", "type": "Hatchback", "segment": "Budget", "base_price": 564000, "variants": ["XE", "XM", "XT", "XZ+"]},
    {"id": "tata-punch", "brand": "Tata", "name": "Punch", "type": "SUV", "segment": "Micro SUV", "base_price": 612000, "variants": ["Pure", "Adventure", "Accomplished", "Creative"]},
    {"id": "tata-altroz", "brand": "Tata", "name": "Altroz", "type": "Hatchback", "segment": "Premium Hatchback", "base_price": 664000, "variants": ["XE", "XM", "XT", "XZ", "XZ+"]},
    {"id": "tata-tigor", "brand": "Tata", "name": "Tigor", "type": "Sedan", "segment": "Compact Sedan", "base_price": 629000, "variants": ["XE", "XM", "XZ", "XZ+"]},
    {"id": "tata-nexon", "brand": "Tata", "name": "Nexon", "type": "SUV", "segment": "Compact SUV", "base_price": 814000, "variants": ["Smart", "Pure", "Creative", "Fearless"]},
    {"id": "tata-nexon-ev", "brand": "Tata", "name": "Nexon EV", "type": "SUV", "segment": "Compact SUV", "base_price": 1449000, "variants": ["Creative", "Fearless", "Empowered"]},
    {"id": "tata-harrier", "brand": "Tata", "name": "Harrier", "type": "SUV", "segment": "Mid-size SUV", "base_price": 1549000, "variants": ["Smart", "Pure", "Adventure", "Fearless"]},
    {"id": "tata-safari", "brand": "Tata", "name": "Safari", "type": "SUV", "segment": "Mid-size SUV", "base_price": 1619000, "variants": ["Smart", "Pure", "Adventure", "Accomplished"]},
    {"id": "tata-curvv", "brand": "Tata", "name": "Curvv", "type": "SUV", "segment": "Coupe SUV", "base_price": 1050000, "variants": ["Smart", "Pure", "Creative"]},
    
    {"id": "mahindra-bolero", "brand": "Mahindra", "name": "Bolero", "type": "SUV", "segment": "Utility", "base_price": 979000, "variants": ["B4", "B6", "B6(O)"]},
    {"id": "mahindra-xuv300", "brand": "Mahindra", "name": "XUV300", "type": "SUV", "segment": "Compact SUV", "base_price": 799000, "variants": ["W4", "W6", "W8", "W8(O)"]},
    {"id": "mahindra-xuv400-ev", "brand": "Mahindra", "name": "XUV400 EV", "type": "SUV", "segment": "Compact SUV", "base_price": 1549000, "variants": ["EC", "EL"]},
    {"id": "mahindra-xuv700", "brand": "Mahindra", "name": "XUV700", "type": "SUV", "segment": "Mid-size SUV", "base_price": 1399000, "variants": ["MX", "AX3", "AX5", "AX7", "AX7L"]},
    {"id": "mahindra-thar", "brand": "Mahindra", "name": "Thar", "type": "SUV", "segment": "Off-road SUV", "base_price": 1125000, "variants": ["AX (O)", "LX"]},
    {"id": "mahindra-scorpio-n", "brand": "Mahindra", "name": "Scorpio N", "type": "SUV", "segment": "Mid-size SUV", "base_price": 1360000, "variants": ["Z2", "Z4", "Z6", "Z8", "Z8L"]},
    {"id": "mahindra-bolero-neo", "brand": "Mahindra", "name": "Bolero Neo", "type": "SUV", "segment": "Utility", "base_price": 994000, "variants": ["N4", "N8", "N10", "N10(O)"]},
    
    {"id": "kia-sonet", "brand": "Kia", "name": "Sonet", "type": "SUV", "segment": "Compact SUV", "base_price": 799000, "variants": ["HTE", "HTK", "HTK+", "HTX", "GTX+"]},
    {"id": "kia-seltos", "brand": "Kia", "name": "Seltos", "type": "SUV", "segment": "Mid-size SUV", "base_price": 1089000, "variants": ["HTE", "HTK+", "HTX", "GTX+", "X-Line"]},
    {"id": "kia-carens", "brand": "Kia", "name": "Carens", "type": "MUV", "segment": "MPV", "base_price": 1044000, "variants": ["Premium", "Prestige", "Luxury", "Luxury Plus"]},
    {"id": "kia-ev6", "brand": "Kia", "name": "EV6", "type": "SUV", "segment": "Premium SUV", "base_price": 6095000, "variants": ["GT Line", "GT Line AWD"]},
    
    {"id": "toyota-glanza", "brand": "Toyota", "name": "Glanza", "type": "Hatchback", "segment": "Premium Hatchback", "base_price": 686000, "variants": ["E", "S", "G", "V"]},
    {"id": "toyota-urban-cruiser-hyryder", "brand": "Toyota", "name": "Urban Cruiser Hyryder", "type": "SUV", "segment": "Mid-size SUV", "base_price": 1114000, "variants": ["E", "S", "G", "V"]},
    {"id": "toyota-innova-crysta", "brand": "Toyota", "name": "Innova Crysta", "type": "MUV", "segment": "MPV", "base_price": 1999000, "variants": ["GX", "VX", "ZX"]},
    {"id": "toyota-innova-hycross", "brand": "Toyota", "name": "Innova Hycross", "type": "MUV", "segment": "MPV", "base_price": 1977000, "variants": ["G", "GX", "VX", "ZX", "ZX(O)"]},
    {"id": "toyota-fortuner", "brand": "Toyota", "name": "Fortuner", "type": "SUV", "segment": "Premium SUV", "base_price": 3343000, "variants": ["Standard", "Legender", "GR-S"]},
    
    {"id": "honda-amaze", "brand": "Honda", "name": "Amaze", "type": "Sedan", "segment": "Compact Sedan", "base_price": 715000, "variants": ["E", "S", "VX"]},
    {"id": "honda-city", "brand": "Honda", "name": "City", "type": "Sedan", "segment": "Mid-size Sedan", "base_price": 1182000, "variants": ["SV", "V", "VX", "ZX"]},
    {"id": "honda-elevate", "brand": "Honda", "name": "Elevate", "type": "SUV", "segment": "Mid-size SUV", "base_price": 1158000, "variants": ["SV", "V", "VX", "ZX"]},
    
    {"id": "mg-hector", "brand": "MG", "name": "Hector", "type": "SUV", "segment": "Mid-size SUV", "base_price": 1399000, "variants": ["Style", "Shine", "Smart", "Sharp Pro", "Savvy Pro"]},
    {"id": "mg-astor", "brand": "MG", "name": "Astor", "type": "SUV", "segment": "Compact SUV", "base_price": 998000, "variants": ["Style", "Super", "Smart", "Sharp", "Savvy"]},
    {"id": "mg-zs-ev", "brand": "MG", "name": "ZS EV", "type": "SUV", "segment": "Compact SUV", "base_price": 1898000, "variants": ["Excite", "Exclusive", "Essence"]},
    {"id": "mg-comet-ev", "brand": "MG", "name": "Comet EV", "type": "Hatchback", "segment": "Budget", "base_price": 699000, "variants": ["Pace", "Play", "Plush"]},
    
    {"id": "skoda-slavia", "brand": "Skoda", "name": "Slavia", "type": "Sedan", "segment": "Mid-size Sedan", "base_price": 1089000, "variants": ["Active", "Ambition", "Style"]},
    {"id": "skoda-kushaq", "brand": "Skoda", "name": "Kushaq", "type": "SUV", "segment": "Compact SUV", "base_price": 1089000, "variants": ["Active", "Ambition", "Style", "Monte Carlo"]},
    {"id": "skoda-kodiaq", "brand": "Skoda", "name": "Kodiaq", "type": "SUV", "segment": "Premium SUV", "base_price": 3999000, "variants": ["Style", "Sportline", "L&K"]},
    
    {"id": "volkswagen-virtus", "brand": "Volkswagen", "name": "Virtus", "type": "Sedan", "segment": "Mid-size Sedan", "base_price": 1155000, "variants": ["Comfortline", "Highline", "Topline", "GT Plus"]},
    {"id": "volkswagen-taigun", "brand": "Volkswagen", "name": "Taigun", "type": "SUV", "segment": "Compact SUV", "base_price": 1169000, "variants": ["Comfortline", "Highline", "Topline", "GT Plus"]},
    
    {"id": "renault-kwid", "brand": "Renault", "name": "Kwid", "type": "Hatchback", "segment": "Budget", "base_price": 469000, "variants": ["RXE", "RXL", "RXT", "Climber"]},
    {"id": "renault-kiger", "brand": "Renault", "name": "Kiger", "type": "SUV", "segment": "Compact SUV", "base_price": 599000, "variants": ["RXE", "RXL", "RXT", "RXZ"]},
    {"id": "renault-triber", "brand": "Renault", "name": "Triber", "type": "MUV", "segment": "MPV", "base_price": 599000, "variants": ["RXE", "RXL", "RXT", "RXZ"]},
    
    {"id": "citroen-c3", "brand": "Citroen", "name": "C3", "type": "Hatchback", "segment": "Budget", "base_price": 616000, "variants": ["Live", "Feel", "Shine"]},
    {"id": "citroen-c3-aircross", "brand": "Citroen", "name": "C3 Aircross", "type": "SUV", "segment": "Compact SUV", "base_price": 999000, "variants": ["You", "Plus", "Max"]},
    
    {"id": "jeep-compass", "brand": "Jeep", "name": "Compass", "type": "SUV", "segment": "Premium SUV", "base_price": 2069000, "variants": ["Sport", "Longitude", "Limited", "Model S"]},
    {"id": "byd-atto-3", "brand": "BYD", "name": "Atto 3", "type": "SUV", "segment": "Premium SUV", "base_price": 3399000, "variants": ["Extended Range"]},
    {"id": "nissan-magnite", "brand": "Nissan", "name": "Magnite", "type": "SUV", "segment": "Compact SUV", "base_price": 599000, "variants": ["XE", "XL", "XV", "XV Premium"]},
]

cars = []

for idx, model in enumerate(models_data):
    rand_id = random.randint(100000, 199999)
    car = {
        "id": model["id"],
        "name": f'{model["brand"]} {model["name"]}',
        "brand": model["brand"],
        "bodyType": model["type"],
        "segment": model["segment"],
        "priceRange": {
            "min": model["base_price"],
            "max": int(model["base_price"] * (1.3 + (len(model["variants"]) * 0.05)))
        },
        "launchYear": random.choice([2022, 2023, 2024, 2025]),
        "seatingCapacity": 7 if model["segment"] in ["MPV", "Premium MPV"] or model["id"] in ["mahindra-scorpio-n", "mahindra-xuv700", "tata-safari"] else 5,
        "overallRating": round(random.uniform(3.8, 4.8), 1),
        "totalReviews": random.randint(100, 5000),
        "images": [
            { "url": f"https://imgd.aeplcdn.com/664x374/n/cw/ec/{rand_id}/{model['brand'].lower().replace(' ', '-')}-{model['name'].lower().replace(' ', '-')}-exterior-right-front-three-quarter.jpeg", "alt": f"{model['name']} Front View", "type": "exterior" },
            { "url": f"https://imgd.aeplcdn.com/664x374/n/cw/ec/{rand_id}/{model['brand'].lower().replace(' ', '-')}-{model['name'].lower().replace(' ', '-')}-interior-dashboard.jpeg", "alt": f"{model['name']} Interior", "type": "interior" }
        ],
        "dimensions": {
            "length": str(random.randint(3600, 4800)),
            "width": str(random.randint(1600, 1900)),
            "height": str(random.randint(1500, 1850)),
            "wheelbase": str(random.randint(2400, 2800))
        },
        "prosAndCons": {
            "pros": ["Good performance", "Feature rich", "Spacious interior"],
            "cons": ["Slightly expensive top models", "Waiting period"]
        },
        "variants": [],
        "competitorIds": [],
        "tags": ["popular", "value-for-money"] if random.random() > 0.5 else ["premium"]
    }
    
    current_price = model["base_price"]
    for i, v_name in enumerate(model["variants"]):
        is_top = i == len(model["variants"]) - 1
        is_ev = "EV" in model["name"]
        
        variant = {
            "id": f"{model['id']}-{v_name.lower().replace(' ', '-').replace('+', '-plus').replace('(', '').replace(')', '')}",
            "name": v_name,
            "priceExShowroom": current_price,
            "fuelType": "Electric" if is_ev else random.choice(["Petrol", "Diesel"]),
            "transmission": "Automatic" if is_top else random.choice(["Manual", "Automatic"]),
            "engineCC": 0 if is_ev else random.choice([998, 1197, 1493, 1498, 1996]),
            "power": "140 bhp" if is_ev else f"{random.randint(70, 190)} bhp",
            "torque": "300 Nm" if is_ev else f"{random.randint(110, 400)} Nm",
            "mileage": f"{random.randint(300, 500)} km/charge" if is_ev else f"{round(random.uniform(12.0, 26.0), 2)} kmpl",
            "airbags": 6 if is_top else 2,
            "bootSpace": f"{random.randint(250, 500)} L",
            "groundClearance": f"{random.randint(160, 220)} mm",
            "fuelTankCapacity": "0 L" if is_ev else f"{random.randint(35, 60)} L",
            "features": [
                {"name": "Power Steering", "category": "convenience", "isHighlight": False},
                {"name": "Airbags", "category": "safety", "isHighlight": True},
                {"name": "Touchscreen Display", "category": "technology", "isHighlight": is_top}
            ],
            "keyHighlights": ["Dual Airbags", "ABS with EBD"] if not is_top else ["6 Airbags", "Sunroof", "ADAS"]
        }
        car["variants"].append(variant)
        current_price += int(current_price * random.uniform(0.1, 0.15))
    
    cars.append(car)

with open(os.path.join(DATA_DIR, "cars.json"), "w") as f:
    json.dump(cars, f, indent=2)


service_network = {}
brands = list(set([m["brand"] for m in models_data]))
cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Ranchi", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur", "Hubli-Dharwad"]
for brand in brands:
    service_network[brand] = {}
    multiplier = 1
    if brand == "Maruti Suzuki": multiplier = 5
    elif brand in ["Hyundai", "Tata", "Mahindra"]: multiplier = 3
    
    for city in cities:
        service_network[brand][city] = int(random.randint(2, 15) * multiplier)

with open(os.path.join(DATA_DIR, "serviceNetwork.json"), "w") as f:
    json.dump(service_network, f, indent=2)


reviews = {}
for car in cars:
    reviews[car["id"]] = {
        "overall": car["overallRating"],
        "reliability": round(random.uniform(3.5, 4.8), 1),
        "comfort": round(random.uniform(3.5, 4.8), 1),
        "performance": round(random.uniform(3.5, 4.8), 1),
        "valueForMoney": round(random.uniform(3.5, 4.8), 1),
        "serviceExperience": round(random.uniform(3.5, 4.8), 1),
        "totalReviews": car["totalReviews"],
        "sentimentSummary": f"Owners generally appreciate the {car['name']} for its features and ride quality. Some feel that top variants are slightly expensive."
    }

with open(os.path.join(DATA_DIR, "reviews.json"), "w") as f:
    json.dump(reviews, f, indent=2)


resale_factors = {
    "brandMultipliers": {
        "Maruti Suzuki": 1.15,
        "Toyota": 1.20,
        "Hyundai": 1.08,
        "Tata": 0.95,
        "Mahindra": 1.05,
        "Kia": 1.02,
        "Honda": 1.10,
        "MG": 0.90,
        "Skoda": 0.85,
        "Volkswagen": 0.85,
        "Renault": 0.80,
        "Citroen": 0.75,
        "Jeep": 0.85,
        "BYD": 0.80,
        "Nissan": 0.80
    },
    "segmentRetention": {
        "Hatchback": { "year1": 85, "year2": 75, "year3": 65, "year5": 48 },
        "SUV": { "year1": 87, "year2": 78, "year3": 70, "year5": 55 },
        "Sedan": { "year1": 80, "year2": 70, "year3": 60, "year5": 45 },
        "MUV": { "year1": 88, "year2": 80, "year3": 72, "year5": 58 }
    },
    "fuelTypeAdjustment": {
        "Petrol": 1.0,
        "Diesel": 0.95,
        "CNG": 1.05,
        "Electric": 0.80
    },
    "cityDemandFactor": {
        "Mumbai": 1.05,
        "Delhi": 1.08,
        "Bangalore": 1.06,
        "Chennai": 1.02,
        "Hyderabad": 1.04
    }
}

with open(os.path.join(DATA_DIR, "resaleFactors.json"), "w") as f:
    json.dump(resale_factors, f, indent=2)


fuel_prices = {
    "Maharashtra": { "petrol": 104.21, "diesel": 92.15, "cng": 89.50 },
    "Karnataka": { "petrol": 101.94, "diesel": 87.89, "cng": 79.90 },
    "Delhi": { "petrol": 96.72, "diesel": 89.62, "cng": 74.09 },
    "Tamil Nadu": { "petrol": 102.63, "diesel": 94.24, "cng": 82.50 },
    "Gujarat": { "petrol": 96.42, "diesel": 92.17, "cng": 76.50 },
    "Uttar Pradesh": { "petrol": 96.57, "diesel": 89.76, "cng": 78.50 },
    "Kerala": { "petrol": 107.56, "diesel": 96.43, "cng": 85.00 },
    "West Bengal": { "petrol": 106.03, "diesel": 92.76, "cng": 84.50 },
    "Telangana": { "petrol": 109.66, "diesel": 97.82, "cng": 92.50 },
    "Rajasthan": { "petrol": 108.48, "diesel": 93.72, "cng": 88.00 }
}

with open(os.path.join(DATA_DIR, "fuelPrices.json"), "w") as f:
    json.dump(fuel_prices, f, indent=2)


cities_data = [
    {"name": "Mumbai", "state": "Maharashtra", "tier": 1, "terrain": "flat", "trafficDensity": "high", "climateType": "humid", "electricityRate": 8.50},
    {"name": "Delhi", "state": "Delhi", "tier": 1, "terrain": "flat", "trafficDensity": "high", "climateType": "extreme", "electricityRate": 6.50},
    {"name": "Bangalore", "state": "Karnataka", "tier": 1, "terrain": "hilly", "trafficDensity": "high", "climateType": "moderate", "electricityRate": 8.10},
    {"name": "Chennai", "state": "Tamil Nadu", "tier": 1, "terrain": "flat", "trafficDensity": "high", "climateType": "humid", "electricityRate": 7.50},
    {"name": "Hyderabad", "state": "Telangana", "tier": 1, "terrain": "flat", "trafficDensity": "medium", "climateType": "hot", "electricityRate": 7.20},
    {"name": "Pune", "state": "Maharashtra", "tier": 2, "terrain": "hilly", "trafficDensity": "high", "climateType": "moderate", "electricityRate": 8.20},
    {"name": "Ahmedabad", "state": "Gujarat", "tier": 2, "terrain": "flat", "trafficDensity": "medium", "climateType": "hot", "electricityRate": 6.80},
    {"name": "Kolkata", "state": "West Bengal", "tier": 1, "terrain": "flat", "trafficDensity": "high", "climateType": "humid", "electricityRate": 7.80},
    {"name": "Jaipur", "state": "Rajasthan", "tier": 2, "terrain": "flat", "trafficDensity": "medium", "climateType": "extreme", "electricityRate": 7.50},
    {"name": "Chandigarh", "state": "Chandigarh", "tier": 2, "terrain": "flat", "trafficDensity": "low", "climateType": "extreme", "electricityRate": 5.50}
]

with open(os.path.join(DATA_DIR, "cities.json"), "w") as f:
    json.dump(cities_data, f, indent=2)


forum_data = []
car_ids = [m["id"] for m in cars]
for i in range(1, 21):
    forum_data.append({
        "id": f"post-{i}",
        "title": f"Question about {random.choice(car_ids).replace('-', ' ')}",
        "content": "I am planning to buy this car. What is the real world mileage? Any major issues?",
        "authorName": f"User{random.randint(100, 999)}",
        "category": random.choice(["review", "comparison", "issue"]),
        "carId": random.choice(car_ids),
        "createdAt": f"2026-08-{random.randint(10, 28)}T10:30:00Z",
        "likes": random.randint(0, 100),
        "replies": [{"author": "Expert1", "content": "It is a great car, mileage is around 15kmpl in city.", "likes": 5}],
        "tags": ["buying", "mileage"]
    })

with open(os.path.join(DATA_DIR, "forum.json"), "w") as f:
    json.dump(forum_data, f, indent=2)

print('All JSON files generated successfully!')
