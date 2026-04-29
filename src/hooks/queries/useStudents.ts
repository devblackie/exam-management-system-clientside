// clientside/src/hooks/queries/useStudents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import {
  getStudents,
  getStudentStats,
  searchStudents,
  getStudentRecord,
  getStudentJourney,
  getRawMarks,
  saveRawMarks,
  deleteStudent,
  updateStudentName,
  bulkRegisterStudents,
  grantAcademicLeave,
  readmitStudent,
  revertStatusToActive,
} from "@/api/studentsApi";

export const STUDENT_KEYS = {
  list: (search: string, page: number) =>
    ["students", "list", search, page] as const,
  stats: () => ["students", "stats"] as const,
  search: (q: string) => ["students", "search", q] as const,
  record: (regNo: string, year: number | string) =>
    ["students", "record", regNo, year] as const,
  journey: (regNo: string) => ["students", "journey", regNo] as const,
  marks: (regNo: string, year: number) =>
    ["students", "marks", regNo, year] as const,
};

/** Search-gated list — never loads all students, empty until user types */
export const useStudentList = (rawSearch: string, page = 1) => {
  const search = useDebounce(rawSearch.trim(), 350);
  return useQuery({
    queryKey: STUDENT_KEYS.list(search, page),
    queryFn: () => getStudents(search, page),
    placeholderData: (prev) => prev, // keeps previous page visible while next loads
  });
};

export const useStudentStats = () =>
  useQuery({
    queryKey: STUDENT_KEYS.stats(),
    queryFn: getStudentStats,
    staleTime: 2 * 60 * 1000,
  });

export const useStudentSearch = (q: string) =>
  useQuery({
    queryKey: STUDENT_KEYS.search(q),
    queryFn: () => searchStudents(q),
    enabled: q.length >= 2, // only fire after 2+ chars
    staleTime: 30 * 1000,
  });

export const useStudentRecord = (regNo: string, yearOfStudy: number | string) =>
  useQuery({
    queryKey: STUDENT_KEYS.record(regNo, yearOfStudy),
    queryFn: () => getStudentRecord(regNo, yearOfStudy),
    enabled: !!regNo && !!yearOfStudy,
  });

export const useStudentJourney = (regNo: string) =>
  useQuery({
    queryKey: STUDENT_KEYS.journey(regNo),
    queryFn: () => getStudentJourney(regNo),
    enabled: !!regNo,
  });

export const useRawMarks = (regNo: string, yearOfStudy: number) =>
  useQuery({
    queryKey: STUDENT_KEYS.marks(regNo, yearOfStudy),
    queryFn: () => getRawMarks(regNo, yearOfStudy),
    enabled: !!regNo && yearOfStudy > 0,
  });

export const useSaveRawMarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveRawMarks,
    onSuccess: (_, payload) => {
      // Invalidate the marks cache for this student
      qc.invalidateQueries({ queryKey: ["students", "marks", payload.regNo] });
    },
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
};

export const useUpdateStudentName = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateStudentName(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
};

export const useBulkRegisterStudents = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (students: Parameters<typeof bulkRegisterStudents>[0]) =>
      bulkRegisterStudents(students),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useGrantAcademicLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: Parameters<typeof grantAcademicLeave>) =>
      grantAcademicLeave(...args),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
};

export const useReadmitStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
      readmitStudent(id, remarks),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
};

export const useRevertStatusToActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revertStatusToActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
};
