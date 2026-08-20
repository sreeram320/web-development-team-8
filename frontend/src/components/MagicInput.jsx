import { useState } from "react";
function MagicInput({ onExtract }) {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleExtract = async () => {
    if (!story.trim()) {
      setError("Please enter your insurance claim story.");
      return;
    }
    setLoading(true);
    setError("");
    try {
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
          result.message || "Failed to extract information."
        );
      }
      console.log("AI Extraction Result:", result.data);
      if (onExtract) {
        onExtract(result.data);
      }
    } catch (error) {
      console.error("Extraction error:", error);
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <h2>Magic AI Input</h2>
      <p>Describe your insurance claim in your own words.</p>
      <textarea
        value={story}
        onChange={(e) => setStory(e.target.value)}
        placeholder="Example: I hit a deer on I-95 yesterday in my Honda, and the windshield shattered."
        rows={6}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          resize: "vertical",
        }}
      />
      <button
        onClick={handleExtract}
        disabled={loading}
        style={{
          marginTop: "12px",
          padding: "10px 20px",
        }}
      >
        {loading ? "AI Processing..." : "Extract with AI"}
      </button>
      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}
    </div>
  );
}
export default MagicInput;
