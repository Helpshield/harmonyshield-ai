import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onRefresh?: () => void;
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  actions?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
  mobileCardRender?: (row: T, index: number) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  currentPage,
  totalPages,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  isLoading,
  onPageChange,
  onNextPage,
  onPreviousPage,
  onRefresh,
  title,
  description,
  searchPlaceholder,
  onSearch,
  actions,
  emptyMessage = 'No data available',
  className,
  mobileCardRender
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Previous page
    if (hasPreviousPage) {
      items.push(
        <PaginationItem key="prev">
          <PaginationPrevious 
            onClick={onPreviousPage}
            className="cursor-pointer"
          />
        </PaginationItem>
      );
    }

    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink 
            onClick={() => onPageChange(1)}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            onClick={() => onPageChange(page)}
            isActive={page === currentPage}
            className="cursor-pointer"
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            onClick={() => onPageChange(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next page
    if (hasNextPage) {
      items.push(
        <PaginationItem key="next">
          <PaginationNext 
            onClick={onNextPage}
            className="cursor-pointer"
          />
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <Card className={cn("shadow-card", className)}>
      {/* Header */}
      {(title || description || onSearch || onRefresh || actions) && (
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && <CardTitle className="text-xl">{title}</CardTitle>}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {onSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder || "Search..."}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              )}
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              )}
              {actions}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead 
                    key={String(column.key)} 
                    className={column.className}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="animate-shield-pulse">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell 
                        key={String(column.key)} 
                        className={column.className}
                      >
                        {column.render 
                          ? column.render(row[column.key], row)
                          : String(row[column.key] || '-')
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-shield-pulse">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            data.map((row, index) => (
              <Card key={index} className="p-4">
                {mobileCardRender ? mobileCardRender(row, index) : (
                  <div className="space-y-2">
                    {columns.filter(col => !col.mobileHidden).map((column) => (
                      <div key={String(column.key)} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {column.label}:
                        </span>
                        <span className="text-sm">
                          {column.render 
                            ? column.render(row[column.key], row)
                            : String(row[column.key] || '-')
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * 10 + 1, totalCount)} to{' '}
                {Math.min(currentPage * 10, totalCount)} of {totalCount} results
              </div>
              <Pagination>
                <PaginationContent>
                  {renderPaginationItems()}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}