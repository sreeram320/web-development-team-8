const { ChatOllama } = require("@langchain/ollama");

const model = new ChatOllama({
  model: "qwen2.5:0.5b",
  temperature: 0,
});
function normalizeClaim(data, originalText) {
  const story = originalText.toLowerCase();

  let incidentType = null;
  let vehicle = null;
  let damage = null;
  let location = null;
  let date = null;

  // -----------------------------
  // 1. INCIDENT TYPE
  // -----------------------------

  if (
    story.includes("deer") ||
    story.includes("animal") ||
    story.includes("dog") ||
    story.includes("cat") ||
    story.includes("cow") ||
    story.includes("horse") ||
    story.includes("wildlife")
  ) {
    incidentType = "animal_collision";
  } else if (
    story.includes("stole") ||
    story.includes("stolen") ||
    story.includes("theft") ||
    story.includes("robbed")
  ) {
    incidentType = "theft";
  } else if (
    story.includes("fire") ||
    story.includes("burned") ||
    story.includes("burnt")
  ) {
    incidentType = "fire";
  } else if (
    story.includes("storm") ||
    story.includes("hurricane") ||
    story.includes("tornado") ||
    story.includes("hail") ||
    story.includes("flood")
  ) {
    incidentType = "weather_damage";
  } else if (
    story.includes("crashed") ||
    story.includes("collision") ||
    story.includes("accident") ||
    story.includes("hit another car") ||
    story.includes("hit another vehicle") ||
    story.includes("someone hit") ||
    story.includes("was hit") ||
    story.includes("rear-ended") ||
    story.includes("rear ended")
  ) {
    incidentType = "vehicle_collision";
  }

  // -----------------------------
  // 2. VEHICLE
  // -----------------------------

  if (typeof data.vehicle === "string") {
    const possibleVehicle = data.vehicle.trim();

    if (
      possibleVehicle &&
      story.includes(possibleVehicle.toLowerCase())
    ) {
      vehicle = possibleVehicle;
    }
  }

  // Generic vehicle fallback
  if (!vehicle) {
    if (/\bcar\b/i.test(story)) {
      vehicle = "car";
    } else if (/\bvehicle\b/i.test(story)) {
      vehicle = "vehicle";
    } else if (/\btruck\b/i.test(story)) {
      vehicle = "truck";
    } else if (/\bsuv\b/i.test(story)) {
      vehicle = "SUV";
    }
  }

  // -----------------------------
  // 3. DAMAGE
  // -----------------------------

  const damageKeywords = [
    { keyword: "windshield", value: "windshield" },
    { keyword: "bumper", value: "bumper" },
    { keyword: "driver door", value: "driver_door" },
    { keyword: "passenger door", value: "passenger_door" },
    { keyword: "door", value: "door" },
    { keyword: "hood", value: "hood" },
    { keyword: "mirror", value: "mirror" },
    { keyword: "roof", value: "roof" },
    { keyword: "tire", value: "tire" },
    { keyword: "wheel", value: "wheel" },
    { keyword: "headlight", value: "headlight" },
    { keyword: "taillight", value: "taillight" },
  ];

  for (const item of damageKeywords) {
    if (story.includes(item.keyword)) {
      damage = item.value;
      break;
    }
  }

  // Fallback to LLM damage only if it appears in the story
  if (!damage && typeof data.damage === "string") {
    const possibleDamage = data.damage.trim().toLowerCase();

    for (const item of damageKeywords) {
      if (
        possibleDamage.includes(item.keyword) &&
        story.includes(item.keyword)
      ) {
        damage = item.value;
        break;
      }
    }
  }

  // -----------------------------
  // 4. LOCATION
  // -----------------------------

  const knownLocations = [
    "parking lot",
    "highway",
    "road",
    "street",
    "intersection",
    "i-95",
    "outside my house",
  ];

  for (const knownLocation of knownLocations) {
    if (story.includes(knownLocation)) {
      location = knownLocation;
      break;
    }
  }

  // Use LLM location only if it is actually a location
  if (!location && typeof data.location === "string") {
    const possibleLocation = data.location.trim();
    const locationLower = possibleLocation.toLowerCase();

    const isDamageWord = damageKeywords.some(
      (item) => locationLower === item.keyword
    );

    const isEventWord = [
      "storm",
      "hurricane",
      "tornado",
      "hail",
      "flood",
      "fire",
      "accident",
      "collision",
    ].includes(locationLower);

    if (
      possibleLocation &&
      !isDamageWord &&
      !isEventWord &&
      story.includes(locationLower)
    ) {
      location = possibleLocation;
    }
  }

  // -----------------------------
  // 5. DATE
  // -----------------------------

  if (story.includes("yesterday")) {
    date = "yesterday";
  } else if (story.includes("today")) {
    date = "today";
  } else if (story.includes("last night")) {
    date = "last night";
  } else if (typeof data.date === "string") {
    const possibleDate = data.date.trim();

    if (
      possibleDate &&
      story.includes(possibleDate.toLowerCase())
    ) {
      date = possibleDate;
    }
  }

  return {
    incidentType,
    vehicle,
    damage,
    location,
    date,
  };
}

async function extractClaim(text) {
  const prompt = `
You are an insurance claim data extraction engine.

Extract information ONLY from the USER STORY.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not explain anything.

Use exactly this structure:

{
  "incidentType": null,
  "vehicle": null,
  "damage": null,
  "location": null,
  "date": null
}

Rules:

1. If the user hit a deer, animal, or other animal with a vehicle,
   incidentType MUST be "animal_collision".

2. If the user describes a normal crash between vehicles,
   incidentType can be "vehicle_collision".

3. For vehicle, extract the vehicle make or model.
   Example: "my Honda" -> "Honda".

4. For damage, extract the damaged vehicle PART,
   not the condition.
   Example: "windshield shattered" -> "windshield".

5. Extract the location mentioned by the user.

6. Extract the date or relative date mentioned by the user.

7. If information is not mentioned, use null.

USER STORY:
${text}
`;

  const response = await model.invoke(prompt);

  let content = response.content;

  // Remove markdown code fences if the model adds them
  content = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error("LLM returned invalid JSON");
  }

  // Normalize and validate the extracted information
  const normalized = normalizeClaim(parsed, text);

  return normalized;
}

module.exports = {
  extractClaim,
};