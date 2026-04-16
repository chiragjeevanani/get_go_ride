import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ChevronUp, Search, 
  ChevronLeft, ChevronRight, MoreVertical,
  ArrowUpDown, Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const DataTable = ({ 
  columns, 
  data, 
  searchKey, 
  searchPlaceholder = "Search...",
  actions,
  onRowClick
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Sorting Logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter & Sort Data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchTerm && searchKey) {
      result = result.filter(item => 
        String(item[searchKey]).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, searchKey, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full h-11 pl-11 pr-4 bg-zinc-50 dark:bg-[#09090b]/40 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all placeholder:text-zinc-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 admin-scrollbar font-bold">
           {/* Placeholder for future filter buttons */}
           <div className="px-4 py-2 bg-zinc-50 dark:bg-[#09090b]/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              Advanced Filters
           </div>
        </div>
      </div>

      <div className="admin-card overflow-hidden bg-white dark:bg-[#09090b]/20 border-zinc-200 dark:border-zinc-800/50 rounded-lg">
        <div className="overflow-x-auto admin-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable && handleSort(column.key)}
                    className={cn(
                      "px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest",
                      column.sortable && "cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors select-none"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortConfig.key === column.key && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900/50">
              {paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className="admin-table-row group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render 
                        ? column.render(row[column.key], row) 
                        : <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-tight">{row[column.key]}</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                       <Search className="w-10 h-10 text-zinc-400" />
                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No matching records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Professional Pagination */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/10">
          <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest">
            Showing <span className="text-zinc-700 dark:text-zinc-400">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-zinc-700 dark:text-zinc-400">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="text-zinc-700 dark:text-zinc-400">{filteredData.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="h-8 w-8 p-0 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                 <button
                   key={page}
                   onClick={() => setCurrentPage(page)}
                   className={cn(
                     "w-8 h-8 rounded-lg text-[10px] font-bold uppercase transition-all",
                     currentPage === page ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                   )}
                 >
                   {page}
                 </button>
               ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="h-8 w-8 p-0 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
