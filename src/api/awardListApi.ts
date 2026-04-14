// clientside/src/api/awardListApi.ts
import api from "@/config/axiosInstance";
import { AwardDocParams, AwardListEntry, AwardListParams } from "./types";

export async function getAwardList(
  programId: string,
  academicYear?: string,
): Promise<{ success: boolean; count: number; data: AwardListEntry[] }> {
  const params: AwardListParams = { programId };
  if (academicYear) params.academicYear = academicYear;
  const res = await api.get<{
    success: boolean;
    count: number;
    data: AwardListEntry[];
  }>("/promote/award-list", { params });
  return res.data;
}

// Download Word document (simple or classified)
export async function downloadAwardListDoc(
  programId: string,
  variant: "simple" | "classified",
  academicYear?: string,
  programCode?: string,
): Promise<void> {
  const params: AwardDocParams = { programId, variant };
  if (academicYear) params.academicYear = academicYear;

  const res = await api.get("/promote/award-list-doc", {
    params,
    responseType: "blob",
  });

  const year = (academicYear || "ALL").replace("/", "_");
  const label = variant === "classified" ? "CLASSIFIED" : "SIMPLE";
  const fname = `Award_List_${programCode || "PROG"}_${year}_${label}.docx`;

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fname);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}