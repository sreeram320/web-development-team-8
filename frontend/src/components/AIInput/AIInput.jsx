import { useState } from "react";
import { analyzeStory } from "../../services/aiService";

function AIInput({ onAIResult }) {
  const [story, setStory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!story.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await analyzeStory(story);

      console.log("AI result:", result);

      onAIResult(result);
    } catch (err) {
      console.error("AI error:", err);
      setError("Something went wrong while analyzing your story.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="ai-input">
        <div className="ai-input-header">
          <span>✨</span>

          <div>
            <h2>Analyzing your story...</h2>
            <p>
              AI is extracting the relevant information from your description.
            </p>
          </div>
        </div>

        <div className="ai-skeleton">
          <div className="skeleton-line skeleton-line-long"></div>
          <div className="skeleton-line skeleton-line-medium"></div>
          <div className="skeleton-line skeleton-line-short"></div>
        </div>

        <p className="ai-loading-text">
          Please wait while we process your information...
        </p>
      </section>
    );
  }

  return (
    <section className="ai-input">
      <div className="ai-input-header">
        <span>✨</span>

        <div>
          <h2>Describe your incident</h2>
          <p>
            Tell us what happened in your own words. AI will extract the
            relevant information.
          </p>
        </div>
      </div>

      <textarea
        value={story}
        onChange={(event) => setStory(event.target.value)}
        placeholder="Example: I hit a deer on I-95 yesterday in my Honda, and the windshield shattered."
        rows={6}
      />

      <button onClick={handleAnalyze} disabled={!story.trim()}>
        ✨ Analyze with AI
      </button>

      {error && <p>{error}</p>}
    </section>
  );
}

export default AIInput;