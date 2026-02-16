import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface AIReview {
  headline: string;
  score: number;
  summary: string;
  highlights: string[];
  risks: string[];
  actionPlan: string[];
}

// Utility to clean up any markdown formatting that might slip through
const cleanMarkdown = (text: string): string => {
  if (!text) return text;
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold **text**
    .replace(/\*(.+?)\*/g, '$1')       // Remove italic *text*
    .replace(/__(.+?)__/g, '$1')       // Remove bold __text__
    .replace(/_(.+?)_/g, '$1')         // Remove italic _text_
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links [text](url)
    .trim();
};

export default function AIInsights() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [review, setReview] = useState<AIReview | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAIReview = async () => {
    try {
      setLoading(true);
      console.log("Fetching AI review for month:", month, "year:", year);
      const res = await api.get("/ai/monthly-review", {
        params: { month, year }
      });
      console.log("AI Review API response:", res.data);
      if (res.data.success) {
        // Backend returns { month, year, report, aiReview }
        const aiReviewData = res.data.data.aiReview;
        console.log("AI Review data:", aiReviewData);
        
        // Clean up any markdown formatting
        const cleanedReview = {
          ...aiReviewData,
          headline: cleanMarkdown(aiReviewData.headline),
          summary: cleanMarkdown(aiReviewData.summary),
          highlights: aiReviewData.highlights?.map((h: string) => cleanMarkdown(h)) || [],
          risks: aiReviewData.risks?.map((r: string) => cleanMarkdown(r)) || [],
          actionPlan: aiReviewData.actionPlan?.map((a: string) => cleanMarkdown(a)) || [],
        };
        
        setReview(cleanedReview);
        toast.success("AI insights generated!");
      }
    } catch (error: any) {
      console.error("Failed to fetch AI review:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to generate AI insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8" />
          <div>
            <h1 className="text-display mb-2">AI Insights</h1>
            <p className="text-sm text-muted-foreground">
              Smart analysis of your spending patterns
            </p>
          </div>
        </div>

        {/* Month/Year Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Month:</Label>
            <Select value={month.toString()} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {new Date(2000, i).toLocaleString("default", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm">Year:</Label>
            <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={fetchAIReview}
            disabled={loading}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full"
          >
            {loading ? "Generating..." : "Generate Insights"}
          </Button>
        </div>
      </div>

      {!review ? (
        <div className="text-center py-20 space-y-4">
          <Sparkles className="h-16 w-16 mx-auto text-muted-foreground" />
          <div className="text-xl font-medium">No AI Insights Yet</div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Select a month and year above, then click "Generate Insights" to get AI-powered
            analysis of your spending patterns.
          </p>
        </div>
      ) : (
        <>
          {/* Headline & Score */}
          <div className="border border-border/50 rounded-lg p-12 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-section">{review.headline || 'Financial Review'}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Score:</span>
                <span className="text-4xl font-light">{review.score || 0}/10</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              {review.summary || 'No summary available'}
            </p>
          </div>

          {/* Highlights */}
          {review.highlights && review.highlights.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <h3 className="text-section">Highlights</h3>
              </div>
              <div className="grid gap-4">
                {review.highlights.map((highlight: string, i: number) => (
                  <div
                    key={i}
                    className="border border-border/50 rounded-lg p-6 flex items-start gap-4"
                  >
                    <div className="h-2 w-2 rounded-full bg-accent mt-2"></div>
                    <p className="flex-1">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {review.risks && review.risks.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <h3 className="text-section">Potential Risks</h3>
              </div>
              <div className="grid gap-4">
                {review.risks.map((risk: string, i: number) => (
                  <div
                    key={i}
                    className="border border-destructive/30 rounded-lg p-6 flex items-start gap-4 bg-destructive/5"
                  >
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <p className="flex-1">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          {review.actionPlan && review.actionPlan.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                <h3 className="text-section">Action Plan</h3>
              </div>
              <div className="grid gap-4">
                {review.actionPlan.map((action: string, i: number) => (
                  <div
                    key={i}
                    className="border border-border/50 rounded-lg p-6 flex items-start gap-4"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-medium">
                      {i + 1}
                    </div>
                    <p className="flex-1">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
