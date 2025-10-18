"use client";
import { useState, useRef } from "react";
import * as XLSX from 'xlsx';

interface Candidate {
  name: string;
  email: string;
  profile: string;
}

interface ExcelUploadProps {
  onUpload: (candidates: Candidate[]) => void;
  onClose: () => void;
}

export default function ExcelUpload({ onUpload, onClose }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setError("Please select a valid Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selectedFile);
    setError("");
    parseExcelFile(selectedFile);
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row and convert to candidates
        const candidates: Candidate[] = jsonData.slice(1).map((row: any[]) => {
          return {
            name: row[0] || "",
            email: row[1] || "",
            profile: row[2] || ""
          };
        }).filter(candidate => candidate.name && candidate.email && candidate.profile);

        setPreview(candidates);
      } catch (error) {
        setError("Error parsing Excel file. Please check the format.");
        console.error("Excel parsing error:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = () => {
    if (preview.length === 0) {
      setError("No valid candidates found in the file");
      return;
    }

    setLoading(true);
    onUpload(preview);
    setLoading(false);
    onClose();
  };

  const downloadTemplate = () => {
    const templateData = [
      ["Name", "Email", "Profile"],
      ["John Doe", "john@example.com", "Frontend Developer"],
      ["Jane Smith", "jane@example.com", "React Developer"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    XLSX.writeFile(wb, "candidates_template.xlsx");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Upload Candidates via Excel</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">Instructions</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Download the template below to see the required format</li>
              <li>• Excel file should have columns: Name, Email, Profile</li>
              <li>• First row should be headers, data starts from row 2</li>
              <li>• All three fields (Name, Email, Profile) are required</li>
            </ul>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
            <div>
              <h4 className="text-white font-medium mb-1">Download Template</h4>
              <p className="text-white/60 text-sm">Get the Excel template with correct format</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Select Excel File
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="space-y-2">
                <div className="text-4xl">📊</div>
                <p className="text-white/80">
                  {file ? file.name : "Click to select Excel file"}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-3">
                Preview ({preview.length} candidates found)
              </h4>
              <div className="max-h-60 overflow-y-auto bg-white/5 rounded-lg border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-white/60">Name</th>
                      <th className="px-3 py-2 text-left text-white/60">Email</th>
                      <th className="px-3 py-2 text-left text-white/60">Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((candidate, index) => (
                      <tr key={index} className="border-t border-white/10">
                        <td className="px-3 py-2 text-white/80">{candidate.name}</td>
                        <td className="px-3 py-2 text-white/80">{candidate.email}</td>
                        <td className="px-3 py-2 text-white/80">{candidate.profile}</td>
                      </tr>
                    ))}
                    {preview.length > 10 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-white/60 text-center">
                          ... and {preview.length - 10} more candidates
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpload}
              disabled={loading || preview.length === 0}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : `Upload ${preview.length} Candidates`}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
