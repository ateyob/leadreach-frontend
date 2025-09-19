import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateBusinessesModal } from "@/components/GenerateBusinessesModal";
import { useBusinessGroups, useDownloadCSV } from "@/hooks/useBusinesses";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Building2,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Eye,
} from "lucide-react";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [downloadingGroupId, setDownloadingGroupId] = useState<string | null>(
    null
  );

  const { data: businessGroupsData, isLoading, refetch } = useBusinessGroups();
  const downloadCSV = useDownloadCSV(
    (id: string) => setDownloadingGroupId(id),
    () => setDownloadingGroupId(null)
  );

  const groups = businessGroupsData?.groups || [];
  const totalGroups = businessGroupsData?.total || 0;

  // Calculate statistics
  const totalBusinesses = groups.reduce(
    (sum: number, group: any) => sum + (group.businessCount || 0),
    0
  );
  const thisMonthBusinesses = groups
    .filter((group: any) => {
      const createdDate = new Date(group.createdAt);
      const now = new Date();
      return (
        createdDate.getMonth() === now.getMonth() &&
        createdDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum: number, group: any) => sum + (group.businessCount || 0), 0);

  // Filter groups based on search
  const filteredGroups = groups.filter(
    (group: any) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.keywords?.some((keyword: string) =>
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      group.cities?.some((city: string) =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
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
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Lead Generation Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Manage and discover businesses across different markets
            </p>
          </div>
          <Button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate New Businesses
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Groups
              </CardTitle>
              <Users className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGroups}</div>
              <p className="text-xs text-slate-600">Active business groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Businesses
              </CardTitle>
              <Building2 className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalBusinesses.toLocaleString()}
              </div>
              <p className="text-xs text-slate-600">Businesses discovered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {thisMonthBusinesses}
              </div>
              <p className="text-xs text-slate-600">New businesses found</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search groups, keywords, or cities..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs
              value={viewMode}
              onValueChange={setViewMode}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="cards" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Cards
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Table
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-slate-600">Loading business groups...</p>
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm ? "No groups found" : "Ready to generate leads?"}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm
                  ? `No groups match "${searchTerm}". Try a different search term.`
                  : "Create your first business group to get started"}
              </p>
            </div>
            {!searchTerm && (
              <Button onClick={() => setIsGenerateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Your First Group
              </Button>
            )}
          </div>
        ) : (
          <Tabs value={viewMode} className="w-full">
            <TabsContent value="cards" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group: any) => (
                  <Card
                    key={group.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex items-center text-xs text-slate-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(group.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-lg line-clamp-2">
                          {group.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">
                            Keywords:
                          </span>
                          <span className="text-slate-600 ml-1">
                            {group.keywords?.join(", ")}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Cities:
                          </span>
                          <span className="text-slate-600 ml-1">
                            {group.cities?.join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center pt-2">
                          <span className="text-2xl font-bold text-slate-900">
                            {group.businessCount}
                          </span>
                          <span className="text-sm text-slate-600 ml-2">
                            businesses found
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/group/${group.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            downloadCSV.mutate({
                              id: group.id,
                              groupName: group.name,
                            })
                          }
                          disabled={downloadingGroupId === group.id}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {downloadingGroupId === group.id ? "..." : "CSV"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left p-4 font-medium text-slate-700">
                          Group Name
                        </th>
                        <th className="text-left p-4 font-medium text-slate-700">
                          Keywords
                        </th>
                        <th className="text-left p-4 font-medium text-slate-700">
                          Cities
                        </th>
                        <th className="text-left p-4 font-medium text-slate-700">
                          Businesses
                        </th>
                        <th className="text-left p-4 font-medium text-slate-700">
                          Created
                        </th>
                        <th className="text-left p-4 font-medium text-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGroups.map((group: any) => (
                        <tr
                          key={group.id}
                          className="border-b border-slate-100 hover:bg-slate-50/50"
                        >
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <Building2 className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-slate-900">
                                {group.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-slate-600">
                            {group.keywords?.join(", ")}
                          </td>
                          <td className="p-4 text-sm text-slate-600">
                            {group.cities?.join(", ")}
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-900">
                              {group.businessCount}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-600">
                            {new Date(group.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/group/${group.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  downloadCSV.mutate({
                                    id: group.id,
                                    groupName: group.name,
                                  })
                                }
                                disabled={downloadingGroupId === group.id}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!isLoading && filteredGroups.length > 0 && (
          <div className="flex justify-between items-center text-sm text-slate-600">
            <span>
              Showing {filteredGroups.length} of {totalGroups} groups
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
          </div>
        )}

        <GenerateBusinessesModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onSuccess={() => refetch()}
        />
      </main>
    </div>
  );
}
