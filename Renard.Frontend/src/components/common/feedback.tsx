import React, { useState } from "react";
import { LegalLayout } from "@/components/layout/legal-layout";
import { Send, Loader2, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Components ---

// 1. Scale Rating Component (1-10)
const ScaleRating = ({
  label,
  value,
  onChange,
  lowLabel = "Poor",
  highLabel = "Excellent",
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  lowLabel?: string;
  highLabel?: string;
}) => {
  return (
    <div className="space-y-3 py-4 border-b border-border/50 last:border-0">
      <label className="block text-lg font-medium text-foreground">
        {label}
      </label>

      <div className="flex flex-wrap gap-1 sm:gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-md text-sm font-medium transition-all
              ${
                value === num
                  ? "bg-primary text-primary-foreground shadow-md scale-110"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary"
              }
            `}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
};

// 2. Main Page
export default function FeedbackPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    browserExtensionEase: 0,
    cliEase: 0,
    contextUnderstanding: 0,
    summarizationQuality: 0,
    contextScalability: 0,
    knowledgeGraphClarity: 0,
    renardUnderstanding: 0,
    overallRating: 0,
    experience: "",
    improvements: "",
  });

  const updateRating = (field: keyof typeof formData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER}/feedback/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Success View ---
  if (isSubmitted) {
    return (
      <LegalLayout
        title="Thank You"
        lastUpdated={new Date().toLocaleDateString()}
      >
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ThumbsUp className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Feedback Received!
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
            Your insights are incredibly valuable. We use this data directly to
            decide what to build next for Renard.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-secondary text-foreground rounded-full font-medium hover:bg-secondary/80 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </LegalLayout>
    );
  }

  // --- Form View ---
  return (
    <LegalLayout
      title="Product Feedback"
      lastUpdated={new Date().toLocaleDateString()}
    >
      <section className="mb-8">
        <p className="text-lg text-muted-foreground">
          Renard is built for developers, Product Managers, Founders and Scrum
          Masters. Your honest feedback helps us tune our engines to better
          understand <em>your</em> code context.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Contact Info Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground border-b border-border pb-2">
            Contact Information
          </h3>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-lg font-medium text-primary"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full p-3 rounded-lg bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground shadow-sm"
            />
            <p className="text-xs text-muted-foreground">
              We'll only use this to follow up on your feedback if necessary.
            </p>
          </div>
        </div>

        {/* Section 1: Usability */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold border-b border-border pb-2 text-primary">
            Usability & Tools
          </h3>

          <ScaleRating
            label="How easy was it to set up and use the Browser Extension?"
            value={formData.browserExtensionEase}
            onChange={(v) => updateRating("browserExtensionEase", v)}
            lowLabel="Very Difficult"
            highLabel="Effortless"
          />

          <ScaleRating
            label="How easy was it to install and use the CLI Tool?"
            value={formData.cliEase}
            onChange={(v) => updateRating("cliEase", v)}
            lowLabel="Complex"
            highLabel="Intuitive"
          />

          <ScaleRating
            label="How well did you understand how Renard works?"
            value={formData.renardUnderstanding}
            onChange={(v) => updateRating("renardUnderstanding", v)}
            lowLabel="Confusing"
            highLabel="Crystal Clear"
          />
        </div>

        {/* Section 2: Core Value */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-primary border-b border-border pb-2">
            Intelligence & Value
          </h3>

          <ScaleRating
            label="Was Renard helpful in understanding your development context?"
            value={formData.contextUnderstanding}
            onChange={(v) => updateRating("contextUnderstanding", v)}
            lowLabel="Not Helpful"
            highLabel="Game Changer"
          />

          <ScaleRating
            label="How would you rate the quality of the automated summaries?"
            value={formData.summarizationQuality}
            onChange={(v) => updateRating("summarizationQuality", v)}
            lowLabel="Inaccurate"
            highLabel="Spot On"
          />

          <ScaleRating
            label="How well did Renard cope with increasing amounts of context?"
            value={formData.contextScalability}
            onChange={(v) => updateRating("contextScalability", v)}
            lowLabel="Slowed Down"
            highLabel="Seamless"
          />

          <ScaleRating
            label="Was Renard able to accurately draw/visualize your knowledge graph?"
            value={formData.knowledgeGraphClarity}
            onChange={(v) => updateRating("knowledgeGraphClarity", v)}
            lowLabel="Messy"
            highLabel="Insightful"
          />
        </div>

        {/* Section 3: Overall */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-primary border-b border-border pb-2">
            Overall Impressions
          </h3>

          <ScaleRating
            label="What would you rate Renard overall?"
            value={formData.overallRating}
            onChange={(v) => updateRating("overallRating", v)}
            lowLabel="Disappointed"
            highLabel="Love it"
          />

          <div className="space-y-2 pt-4">
            <label className="block text-sm font-medium text-foreground">
              How was your overall experience? (Open thoughts)
            </label>
            <textarea
              required
              value={formData.experience}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, experience: e.target.value }))
              }
              placeholder="Tell us about your workflow..."
              className="w-full min-h-25 p-4 rounded-xl bg-secondary/30 border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              What can we improve?
            </label>
            <textarea
              required
              value={formData.improvements}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  improvements: e.target.value,
                }))
              }
              placeholder="Missing features, bugs, or annoyances..."
              className="w-full min-h-25 p-4 rounded-xl bg-secondary/30 border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Submit Feedback
          </button>
        </div>
      </form>
    </LegalLayout>
  );
}
