import { OpenJev, choice, noul } from 'open-jev';

async function testJev() {
    console.log("Loading Jev...");
    const jev = await OpenJev.load({
        model: "open-jev", // use the smaller 350MB model
        dtype: "q4", // CPU friendly
        onProgress: (p) => console.log(`Downloading: ${Math.round(p.progress * 100)}%`)
    });
    
    console.log("Running decision...");
    const state = "I need a fast SUV for my family of 4. Budget under 20 lakhs.";
    const answers = await jev.decide(state, {
        persona: choice("What is the primary persona of the buyer?", [
            "Family",
            "Enthusiast",
            "Economy",
            "Balanced"
        ]),
        wantsSUV: noul("The buyer explicitly asked for an SUV."),
        wantsFast: noul("The buyer prioritizes speed or performance.")
    });
    
    console.log("Decision result:");
    console.log(JSON.stringify(answers, null, 2));
}

testJev().catch(console.error);
