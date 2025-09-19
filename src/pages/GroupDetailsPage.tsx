import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { businessAPI } from "../lib/api";
import { toast } from "sonner";

interface Business {
  name: string;
  website?: string;
  address: string;
  phone?: string;
}

interface GroupDetails {
  export: {
    name: string;
    keywords: string[];
    cities: string[];
    actualCount: number;
  };
  businesses: Business[];
  total: number;
}

export function GroupDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchGroupDetails = async () => {
      try {
        const response = await businessAPI.getGroupDetails(id);
        setGroupDetails(response);
      } catch (error: any) {
        console.error("Failed to fetch group details:", error);
        toast.error("Failed to load group details");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupDetails();
  }, [id, navigate]);

  const handleDownload = async () => {
    if (!id) return;

    setIsDownloading(true);
    try {
      const response = await businessAPI.downloadCSV(id);

      // Create blob and download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${groupDetails?.export.name.replace(/\s+/g, "-")}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV downloaded successfully!");
    } catch (error: any) {
      console.error("Download failed:", error);
      toast.error("Failed to download CSV");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!groupDetails) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Group not found
          </h2>
          <Button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                size="sm"
              >
                ← Back
              </Button>
              <h1 className="text-2xl font-bold text-slate-900">
                🎯 LeadReach
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, {user?.username}!
              </span>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Group Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {groupDetails.export.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Keywords:</span>
                  <div className="text-slate-600">
                    {groupDetails.export.keywords.join(", ")}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Cities:</span>
                  <div className="text-slate-600">
                    {groupDetails.export.cities.join(", ")}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-slate-700">
                    Total Businesses:
                  </span>
                  <div className="text-slate-600">
                    {groupDetails.export.actualCount}
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? "Downloading..." : "📥 Download CSV"}
            </Button>
          </div>
        </div>

        {/* Business Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">
              Businesses ({groupDetails.total})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Business Name
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-slate-700"
                    style={{ width: "200px" }}
                  >
                    Website
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {groupDetails.businesses.map((business, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-blue-600 font-semibold text-sm">
                            {business.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {business.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-6 py-5"
                      style={{ width: "200px", maxWidth: "200px" }}
                    >
                      <div className="w-full overflow-hidden">
                        {business.website ? (
                          <a
                            href={
                              business.website.startsWith("http")
                                ? business.website
                                : `https://${business.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors w-full"
                            title={business.website.replace(/^https?:\/\//, "")}
                          >
                            <span className="mr-1 flex-shrink-0">🌐</span>
                            <span className="truncate">
                              {business.website.replace(/^https?:\/\//, "")}
                            </span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-sm italic">
                            No website
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {business.phone ? (
                        <a
                          href={`tel:${business.phone}`}
                          className="inline-flex items-center text-slate-700 hover:text-blue-600 text-sm font-medium transition-colors"
                        >
                          <span className="mr-1">📞</span>
                          {business.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm italic">
                          No phone
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-slate-700 max-w-xs">
                        <span className="inline-flex items-start">
                          <span className="mr-1 mt-0.5">📍</span>
                          {business.address}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {groupDetails.businesses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-2">📭</div>
              <p className="text-slate-600">
                No businesses found in this group
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
