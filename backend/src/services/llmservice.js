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
    story.includes("hit another car")
  ) {
    incidentType = "vehicle_collision";
  }

  // -----------------------------
  // 2. VEHICLE
  // -----------------------------

  if (typeof data.vehicle === "string") {
    const possibleVehicle = data.vehicle.trim();

    // Only accept vehicle information if it appears
    // in the original story.
    if (story.includes(possibleVehicle.toLowerCase())) {
      vehicle = possibleVehicle;
    }
  }

  // -----------------------------
  // 3. DAMAGE
  // -----------------------------

  if (typeof data.damage === "string") {
    const damageText = data.damage.toLowerCase();

    if (
      damageText.includes("windshield") &&
      story.includes("windshield")
    ) {
      damage = "windshield";
    } else if (
      damageText.includes("bumper") &&
      story.includes("bumper")
    ) {
      damage = "bumper";
    } else if (
      damageText.includes("door") &&
      story.includes("door")
    ) {
      damage = "door";
    } else if (
      damageText.includes("hood") &&
      story.includes("hood")
    ) {
      damage = "hood";
    } else if (
      damageText.includes("mirror") &&
      story.includes("mirror")
    ) {
      damage = "mirror";
    }
  }

  // -----------------------------
  // 4. LOCATION
  // -----------------------------

  if (typeof data.location === "string") {
    const possibleLocation = data.location.trim();

    if (story.includes(possibleLocation.toLowerCase())) {
      location = possibleLocation;
    }
  }

  // Special case: parking lot
  if (story.includes("parking lot")) {
    location = "parking lot";
  }

  // -----------------------------
  // 5. DATE
  // -----------------------------

  if (typeof data.date === "string") {
    const possibleDate = data.date.trim();

    if (story.includes(possibleDate.toLowerCase())) {
      date = possibleDate;
    }
  }

  if (story.includes("yesterday")) {
    date = "yesterday";
  } else if (story.includes("today")) {
    date = "today";
  } else if (story.includes("last night")) {
    date = "last night";
  }

  return {
    incidentType,
    vehicle,
    damage,
    location,
    date
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