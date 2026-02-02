import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportPDF(data: any[]) {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [["Name", "Email", "Amount"]],
    body: data.map(d => [d.name, d.email, d.amount]),
  });
  doc.save("report.pdf");
}
