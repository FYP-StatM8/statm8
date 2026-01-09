import React, { useMemo } from 'react';

// --- Icons (StatM8 Theme) ---
const Icons = {
  File: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
  ),
  Grid: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  ),
  List: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  )
};

// --- Helper: Robust Markdown Parser ---
const MarkdownText = ({ text }) => {
  if (!text) return <p className="text-gray-400 italic">No summary available.</p>;

  // 1. Split by EVERY newline to ensure list items appear on their own lines
  const lines = text.split('\n');

  return (
    <div className="text-gray-600 text-sm leading-relaxed">
      {lines.map((line, index) => {
        // Remove accidental extra whitespace
        const cleanLine = line.trim();

        // 2. Handle empty lines: render a small spacer instead of a full paragraph
        // This prevents the "huge gap" issue while keeping sections distinct
        if (!cleanLine) {
          return <div key={index} className="h-4" />; 
        }

        // 3. Process Bold Text (**text**)
        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

        return (
          <p key={index} className="mb-1">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={i} className="font-bold text-gray-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};

const ReportItem = ({ report }) => {
  const analysisData = useMemo(() => {
    if (!report || !report.json_response) return null;
    try {
      return JSON.parse(report.json_response);
    } catch (error) {
      console.error("Failed to parse report JSON:", error);
      return null;
    }
  }, [report]);

  if (!report) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!analysisData) return <div className="p-8 text-red-500">Error: Could not parse report data.</div>;

  const { 
    file_type = 'CSV', 
    total_rows = 0, 
    total_columns = 0, 
    ai_summary = '', 
    columns_info = [], 
    sample_rows = [] 
  } = analysisData;

  const handleDownload = async (csv_url:string, csv_name:string) => {
    try {
      // 1. Fetch the file as a blob
      const response = await fetch(csv_url);
      const blob = await response.blob();

      // 2. Create a temporary URL for that blob
      const url = window.URL.createObjectURL(blob);

      // 3. Create a hidden link element
      const link = document.createElement('a');
      link.href = url;

      // 4. Force the filename using your report name
      // We ensure it ends with .csv
      const filename = csv_name.endsWith('.csv')
        ? csv_name
        : `${csv_name}.csv`;

      link.setAttribute('download', filename);

      // 5. Append, click, and cleanup
      document.body.appendChild(link);
      link.click();

      // Clean up DOM and memory
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download the file.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans p-4 md:p-8">
      
      {/* --- Top Header --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          {/* Use top-level metadata for Title and ID */}
          <h1 className="text-3xl md:text-4xl font-bold text-sky-500 mb-2">{report.csv_name || 'Dataset Report'}</h1>
          <div className="flex flex-col text-sm text-gray-400">
            <span>ID: <span className="font-mono text-gray-600">{report._id}</span></span>
            <span>Analyzed: {new Date(report.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-sky-400 hover:bg-sky-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
           <Icons.Download />
           <span>Export PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left Column: Summary & Stats --- */}
        <div className="space-y-6 lg:col-span-1">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-800 font-bold text-lg mb-6">Overview</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-50 text-sky-500 rounded-xl"><Icons.File /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">File Type</p>
                  <p className="text-xl font-bold text-gray-800 uppercase">{file_type}</p>
                </div>
              </div>
              <div className="h-px bg-gray-100 w-full"></div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-50 text-sky-500 rounded-xl"><Icons.List /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Rows</p>
                  <p className="text-xl font-bold text-gray-800">{total_rows.toLocaleString()}</p>
                </div>
              </div>
              <div className="h-px bg-gray-100 w-full"></div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-50 text-sky-500 rounded-xl"><Icons.Grid /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Columns</p>
                  <p className="text-xl font-bold text-gray-800">{total_columns}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-6 bg-sky-400 rounded-full"></span>
              <h3 className="text-gray-800 font-bold text-lg">AI Insights</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar">
               <MarkdownText text={ai_summary} />
            </div>
          </div>

        </div>

        {/* --- Right Column: Detailed Data --- */}
        <div className="lg:col-span-2 space-y-8">
          
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Column Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columns_info.length > 0 ? columns_info.map((col, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-sky-300 transition-colors shadow-sm group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-700 group-hover:text-sky-600 transition-colors truncate w-3/4" title={col.name}>
                      {col.name}
                    </h4>
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md font-mono shrink-0">
                      {col.dtype}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-xs text-gray-400">Unique</p>
                      <p className="font-semibold text-gray-700">{col.unique_count}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-gray-400">Missing</p>
                       <p className={`font-semibold ${col.null_count > 0 ? 'text-red-400' : 'text-green-500'}`}>
                         {col.null_count}
                       </p>
                    </div>
                  </div>
                  {/* Decorative Bar */}
                  <div className="mt-3 flex gap-1 h-1.5">
                    <div className="flex-1 bg-sky-200 rounded-full opacity-50"></div>
                    <div className="flex-1 bg-sky-300 rounded-full opacity-70"></div>
                    <div className="flex-1 bg-sky-400 rounded-full"></div>
                  </div>
                </div>
              )) : (
                <p className="text-gray-400 col-span-2">No column information available.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Data Preview</h2>
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {columns_info.map((col) => (
                        <th key={col.name} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sample_rows.length > 0 ? sample_rows.map((row, i) => (
                      <tr key={i} className="hover:bg-sky-50 transition-colors">
                        {columns_info.map((col) => (
                          <td key={col.name} className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {row[col.name]}
                          </td>
                        ))}
                      </tr>
                    )) : (
                      <tr>
                         <td colSpan={columns_info.length || 1} className="p-4 text-center text-gray-400">
                           No preview data available
                         </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-center">
                 <button onClick={()=>{handleDownload(report.csv_url, report.csv_name)}} className="text-sky-500 text-sm font-medium hover:text-sky-600">Download Full Dataset</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportItem;