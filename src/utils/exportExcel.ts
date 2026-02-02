import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportExcel(data: any[]) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Donations");
  const file = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([file]), "donations.xlsx");
}
