import { useState } from "react";
import { Button } from "@/components/ui/button";
import { businessAPI } from "@/lib/api";
import { toast } from "sonner";

interface GenerateBusinessesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GenerateBusinessesModal({
  isOpen,
  onClose,
  onSuccess,
}: GenerateBusinessesModalProps) {
  const [keywords, setKeywords] = useState("");
  const [cities, setCities] = useState("");
  const [limit, setLimit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const keywordArray = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const cityArray = cities
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      if (keywordArray.length === 0 || cityArray.length === 0) {
        toast.error("Please provide both keywords and cities");
        return;
      }

      const response = await businessAPI.generateBusinesses(
        keywordArray,
        cityArray,
        limit
      );

      toast.success(
        `Successfully generated ${
          response.data?.summary?.discovered || 0
        } businesses!`
      );

      // Reset form
      setKeywords("");
      setCities("");
      setLimit(50);

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Generation failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to generate businesses"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Generate New Businesses
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="keywords"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="restaurant, pizza, italian food"
              required
            />
          </div>

          <div>
            <label
              htmlFor="cities"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Cities (comma-separated)
            </label>
            <input
              type="text"
              id="cities"
              value={cities}
              onChange={(e) => setCities(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Sacramento CA, Davis CA"
              required
            />
          </div>

          <div>
            <label
              htmlFor="limit"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Business Limit
            </label>
            <input
              type="number"
              id="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Generating..." : "🚀 Generate Businesses"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
