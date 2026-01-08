import { StudentMarkRecord } from "@/types/marks";
import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";

// Extend jsPDF type definition for autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
  autoTable: (options: UserOptions) => void;
}

interface SenateReportData {
  institutionName: string;
  programName: string;
  year: string;
  semester: string;
  coordinatorName: string;
  students: StudentMarkRecord[];
}

export function generateSenateReport({
  institutionName,
  programName,
  year,
  semester,
  coordinatorName,
  students,
}: SenateReportData) {
  const doc = new jsPDF({ orientation: "landscape" }) as jsPDFWithAutoTable;

  // Title Section
  doc.setFontSize(14);
  doc.text(institutionName.toUpperCase(), 14, 15);
  doc.setFontSize(12);
  doc.text(`Senate Report: ${programName}`, 14, 25);
  doc.text(`Year: ${year} | Semester: ${semester}`, 14, 32);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 39);
  doc.text(`Coordinator: ${coordinatorName}`, 14, 46);

  // Compute outcomes
  const results = students.map((s) => {
    let outcome = "Pass";
    if (s.total < 30) outcome = "Retake";
    else if (s.total < 40) outcome = "Supplementary";
    return { ...s, outcome };
  });

  const summary = {
    pass: results.filter((r) => r.outcome === "Pass").length,
    supp: results.filter((r) => r.outcome === "Supplementary").length,
    retake: results.filter((r) => r.outcome === "Retake").length,
  };

  const tableData = results.map((s) => [
    s.regNo,
    s.name,
    s.program,
    s.unitCode,
    s.unitName,
    s.cat1 ?? "-",
    s.cat2 ?? "-",
    s.cat3 ?? "-",
    s.assignment ?? "-",
    s.practical ?? "-",
    s.exam ?? "-",
    s.total,
    s.outcome,
  ]);

  autoTable(doc, {
    startY: 55,
    head: [
      [
        "Student ID",
        "Name",
        "Unit Code",
        "Unit Name",
        "CAT",
        "Exam",
        "Total",
        "Outcome",
      ],
    ],
    body: tableData,
    styles: { fontSize: 9, cellPadding: 3 },
    theme: "grid",
  });

  // ✅ Type-safe access to lastAutoTable
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 65;

  doc.setFontSize(11);
  doc.text(`Summary:`, 14, finalY);
  doc.text(`Pass: ${summary.pass}`, 30, finalY + 6);
  doc.text(`Supplementary: ${summary.supp}`, 70, finalY + 6);
  doc.text(`Retake: ${summary.retake}`, 130, finalY + 6);

  // Signatures
  const sigY = finalY + 25;
  doc.text("_______________________", 14, sigY);
  doc.text("Coordinator Signature", 14, sigY + 5);

  doc.text("_______________________", 100, sigY);
  doc.text("Head of Department", 100, sigY + 5);

  doc.text("_______________________", 200, sigY);
  doc.text("Dean / Senate Rep", 200, sigY + 5);

  doc.save(`Senate_Report_${programName}_${year}_${semester}.pdf`);
}
