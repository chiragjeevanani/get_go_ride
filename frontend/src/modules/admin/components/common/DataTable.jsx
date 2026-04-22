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

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  // Sorting Logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
  };

  const toggleFilter = (key, value) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[key] === value) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
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

    // Advanced Filters
    Object.keys(activeFilters).forEach(key => {
      result = result.filter(item => item[key] === activeFilters[key]);
    });

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, searchKey, sortConfig, activeFilters]);

  // Extract unique values for filtering (e.g. status)
  const filterOptions = useMemo(() => {
    const options = {};
    columns.forEach(col => {
      if (col.key === 'status' || col.key === 'subscriptionStatus' || col.key === 'plan' || col.key === 'location') {
        options[col.key] = [...new Set(data.map(item => item[col.key]))];
      }
    });
    return options;
  }, [data, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-11 pr-4 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] font-bold text-zinc-900 focus:outline-none focus:border-primary transition-all placeholder:text-zinc-400 uppercase tracking-tight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
           {Object.keys(activeFilters).length > 0 && (
             <button 
               onClick={clearFilters}
               className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline mr-2"
             >
               Clear Filters
             </button>
           )}
           <div 
             onClick={() => setIsFilterOpen(!isFilterOpen)}
             className={cn(
               "px-4 py-2 border rounded-lg text-[10px] uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 font-black",
               isFilterOpen || Object.keys(activeFilters).length > 0
                 ? "bg-primary text-black border-primary shadow-lg shadow-primary/20" 
                 : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300"
             )}
           >
              <Filter className="w-3.5 h-3.5" />
              {Object.keys(activeFilters).length > 0 ? `Filters (${Object.keys(activeFilters).length})` : "Advanced Filters"}
           </div>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {Object.entries(filterOptions).map(([key, values]) => (
                  <div key={key} className="space-y-3">
                     <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</h4>
                     <div className="flex flex-wrap gap-2">
                        {values.map(val => (
                           <button
                             key={val}
                             onClick={() => toggleFilter(key, val)}
                             className={cn(
                               "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all",
                               activeFilters[key] === val
                                 ? "bg-zinc-900 text-white"
                                 : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300"
                             )}
                           >
                             {val}
                           </button>
                        ))}
                     </div>
                  </div>
               ))}
               {Object.keys(filterOptions).length === 0 && (
                 <div className="col-span-full py-4 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    No advanced filters available for this view
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                      "py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest",
                      column.align === 'right' ? "pr-12 text-right" : "px-6 text-left",
                      column.sortable && "cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors select-none"
                    )}
                  >
                    <div className={cn(
                      "flex items-center gap-2",
                      column.align === 'right' && "justify-end"
                    )}>
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
                    <td 
                      key={column.key} 
                      className={cn(
                        "py-3 whitespace-nowrap",
                        column.align === 'right' ? "pr-12 text-right" : "px-6 text-left"
                      )}
                    >
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
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/10">
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
