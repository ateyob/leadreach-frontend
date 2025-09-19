import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { businessAPI } from "@/lib/api";
import { toast } from "sonner";

export function useBusinessGroups() {
  return useQuery({
    queryKey: ["businessGroups"],
    queryFn: businessAPI.getBusinessGroups,
    staleTime: 30000, // 30 seconds
  });
}

export function useGroupDetails(id: string | undefined) {
  return useQuery({
    queryKey: ["groupDetails", id],
    queryFn: () => businessAPI.getGroupDetails(id!),
    enabled: !!id,
  });
}

export function useGenerateBusinesses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      keywords,
      cities,
      limit,
    }: {
      keywords: string[];
      cities: string[];
      limit: number;
    }) => businessAPI.generateBusinesses(keywords, cities, limit),
    onSuccess: (data: any) => {
      // Invalidate and refetch business groups
      queryClient.invalidateQueries({ queryKey: ["businessGroups"] });
      toast.success(
        `Successfully generated ${
          data.data?.summary?.discovered || 0
        } businesses!`
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to generate businesses"
      );
    },
  });
}

export function useDownloadCSV(
  onStart?: (id: string) => void,
  onFinish?: () => void
) {
  return useMutation({
    mutationFn: async ({
      id,
      groupName,
    }: {
      id: string;
      groupName?: string;
    }) => {
      console.log("Downloading CSV for group ID:", id);
      onStart?.(id);
      const response = await businessAPI.downloadCSV(id);
      return { response, id, groupName };
    },
    onSuccess: ({ response, id, groupName }) => {
      try {
        // Create blob and download
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Use group name for filename if available
        const filename = groupName
          ? `${groupName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${
              new Date().toISOString().split("T")[0]
            }.csv`
          : `business-group-${id}-${
              new Date().toISOString().split("T")[0]
            }.csv`;

        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`CSV downloaded: ${filename}`);
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to process download");
      } finally {
        onFinish?.();
      }
    },
    onError: (error: any) => {
      console.error("CSV download failed:", error);
      toast.error(error.response?.data?.message || "Failed to download CSV");
      onFinish?.();
    },
  });
}
