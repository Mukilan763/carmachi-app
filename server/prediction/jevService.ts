import { OpenJev, choice, noul, score } from 'open-jev';

let jevInstance: any = null;
let jevLoading = false;

export async function initJev() {
    if (jevInstance || jevLoading) return;
    jevLoading = true;
    try {
        console.log('[JEV] Initializing TypeSafe Jev (open-jev model) for semantic prediction...');
        jevInstance = await OpenJev.load({
            model: "open-jev", // 350MB DeBERTa-based System One model
            dtype: "q4",
            onProgress: (p) => {
                if (p.progress % 0.2 === 0) {
                    console.log(`[JEV] Downloading weights: ${Math.round(p.progress * 100)}%`);
                }
            }
        });
        console.log('[JEV] TypeSafe Jev initialized successfully.');
    } catch (e: any) {
        console.error('[JEV] Failed to initialize Jev:', e.message);
    } finally {
        jevLoading = false;
    }
}

// Extract semantic features from user query
export async function analyzeQueryWithJev(query: string) {
    if (!jevInstance) {
        // Fallback or trigger lazy load
        initJev();
        return null; // Return null so caller can fallback to regex
    }

    try {
        const answers = await jevInstance.decide(query, {
            persona: choice("What is the primary persona of the buyer based on the query?", [
                "Family",
                "Enthusiast",
                "Economy",
                "Balanced"
            ]),
            wantsSUV: noul("The buyer explicitly asked for an SUV or large vehicle."),
            wantsFast: noul("The buyer prioritizes speed, performance, or driving dynamics."),
            wantsSafe: noul("The buyer prioritizes safety, build quality, or NCAP ratings."),
            wantsEconomy: noul("The buyer prioritizes fuel economy, mileage, or low running costs.")
        });

        return {
            persona: answers.persona.choice,
            personaConfidence: answers.persona.confidence,
            wantsSUV: answers.wantsSUV.answer,
            wantsFast: answers.wantsFast.answer,
            wantsSafe: answers.wantsSafe.answer,
            wantsEconomy: answers.wantsEconomy.answer
        };
    } catch (e) {
        console.error('[JEV] Decision failed:', e);
        return null;
    }
}
