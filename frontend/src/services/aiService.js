export const analyzeStory = async (story) => {
  // Temporary mock response.
  // We will replace this with the real backend API later.

  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    fullName: "",
    incidentType: "Animal Collision",
    animalType: "Deer",
    description: story,
    termsAccepted: false,
  };
};