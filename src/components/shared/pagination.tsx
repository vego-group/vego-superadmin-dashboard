"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPageSelector?: boolean;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPageSelector = false,
  className = "",
}: PaginationProps) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display (max 5 pages visible)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      end = maxVisible;
    } else if (currentPage > totalPages - half) {
      start = totalPages - maxVisible + 1;
    }

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/30 ${className}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Info Section */}
      <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
        <span className="font-medium text-gray-700">
          {startItem}–{endItem}
        </span>
        {" " + t("of", "من") + " "}
        <span className="font-medium text-gray-700">{totalItems.toLocaleString()}</span>
      </div>

      {/* Items Per Page Selector */}
      {showItemsPerPageSelector && onItemsPerPageChange && (
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-gray-500">{t("Per page", "في الصفحة")}:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
            className="px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white hover:border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      )}

      {/* Page Navigation */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`h-8 px-2 sm:px-3 text-xs sm:text-sm rounded-lg transition ${
            isRtl ? "order-last" : ""
          }`}
          title={t("Previous", "السابق")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === "...") {
              return (
                <span key={`dots-${idx}`} className="px-1 sm:px-2 py-1 text-gray-400 text-xs">
                  …
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={`h-8 min-w-8 px-0 sm:px-2 text-xs sm:text-sm rounded-lg transition ${
                  isActive
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 border-gray-200"
                }`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`h-8 px-2 sm:px-3 text-xs sm:text-sm rounded-lg transition ${
            isRtl ? "order-first" : ""
          }`}
          title={t("Next", "التالي")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
