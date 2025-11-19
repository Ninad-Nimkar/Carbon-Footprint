// ---------------- Firebase Setup ----------------
const firebaseConfig = {
    apiKey: "AIzaSyBGIGmJO1tn1gJg1WkCgKZbUTdTOsI5d4Q",
    authDomain: "carbon-footprint-b6c76.firebaseapp.com",
    databaseURL: "https://carbon-footprint-b6c76-default-rtdb.firebaseio.com",
    projectId: "carbon-footprint-b6c76",
    storageBucket: "carbon-footprint-b6c76.firebasestorage.app",
    messagingSenderId: "291966892852",
    appId: "1:291966892852:web:a55630fc18baaad52f8361"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// ---------------- Calculator Logic ----------------
function computeTotal(km, kwh, water) {
    let travel = km * 0.21;
    let electricity = kwh * 0.92;
    let waterCO2 = water * 0.0003;

    return travel + electricity + waterCO2;
}

document.getElementById("calcBtn").addEventListener("click", () => {
    let km = parseFloat(document.getElementById("km").value);
    let kwh = parseFloat(document.getElementById("kwh").value);
    let water = parseFloat(document.getElementById("water").value);

    let total = computeTotal(km, kwh, water);

    document.getElementById("result").innerText =
        "Your CO₂ footprint: " + total.toFixed(2) + " kg";
});


// ---------------- Save to Firebase ----------------
function saveEntry(km, kwh, water, total) {
    const entryRef = db.ref("entries").push();
    entryRef.set({
        km, kwh, water, total,
        timestamp: Date.now()
    });
}

document.getElementById("saveBtn").addEventListener("click", () => {
    let km = parseFloat(document.getElementById("km").value);
    let kwh = parseFloat(document.getElementById("kwh").value);
    let water = parseFloat(document.getElementById("water").value);

    let total = computeTotal(km, kwh, water);

    saveEntry(km, kwh, water, total);
});


// ---------------- AI Tips (OpenRouter) ----------------
async function getAISuggestions(total) {
    const apiKey = "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";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost:5500",
            "X-Title": "Carbon Footprint Project"
        },
        body: JSON.stringify({
            model: "meta-llama/llama-3.1-8b-instruct",
            messages: [
                {
                    role: "user",
                    content: `Give 5 short, simple carbon footprint reduction tips for someone with score, just the points with gaps in between, no introduction is outro${total}.`
                }
            ]
        })
    });

    const data = await response.json();
    console.log("AI Response:", data);

    return data.choices[0].message.content;
}

document.getElementById("aiBtn").addEventListener("click", async () => {
    document.getElementById("aiOutput").innerText = "Loading AI tips...";

    let km = parseFloat(document.getElementById("km").value);
    let kwh = parseFloat(document.getElementById("kwh").value);
    let water = parseFloat(document.getElementById("water").value);

    let total = computeTotal(km, kwh, water);

    try {
        let tips = await getAISuggestions(total);
        document.getElementById("aiOutput").innerText = tips;
    } catch (err) {
        console.error(err);
        document.getElementById("aiOutput").innerText = "AI error — please try again.";
    }
});