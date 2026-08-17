import { useState } from "react";

function AIInput() {
  const [story, setStory] = useState("");

  const handleAnalyze = () => {
    console.log("User story:", story);
  };

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
    </section>
  );
}

export default AIInput;