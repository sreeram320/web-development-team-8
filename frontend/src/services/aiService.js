export const analyzeStory = async (story) => {
  const response = await fetch("http://localhost:5000/api/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: story,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to analyze the story."
    );
  }

  const data = result.data;

  console.log("Backend extraction:", data);

  return {
    fullName: "",
    incidentType: convertIncidentType(data.incidentType),
    animalType: extractAnimalType(story, data.incidentType),
    vehicleDetails: data.vehicle || "",
    description: story,
    termsAccepted: false,

    // Keep the backend extracted values available
    location: data.location || "",
    date: data.date || "",
    damage: data.damage || "",
  };
};

function convertIncidentType(type) {
  const mapping = {
    animal_collision: "Animal Collision",
    vehicle_collision: "Vehicle Collision",
    accident: "Vehicle Collision",
    theft: "Other",
    fire: "Other",
    weather_damage: "Other",
  };

  return mapping[type] || "";
}

function extractAnimalType(story, incidentType) {
  if (incidentType !== "animal_collision") {
    return "";
  }

  const lowerStory = story.toLowerCase();

  if (lowerStory.includes("deer")) {
    return "Deer";
  }

  if (lowerStory.includes("dog")) {
    return "Dog";
  }

  return "Other";
}