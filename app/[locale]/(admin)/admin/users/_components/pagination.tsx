import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, loading, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1 || loading}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <div className="text-sm font-medium">
        Page {page} of {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages || loading}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
