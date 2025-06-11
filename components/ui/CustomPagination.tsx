import * as React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // No mostrar paginación si no hay suficientes páginas
  if (totalPages <= 1) {
    return null;
  }

  // Crear un array con los números de página a mostrar
  const getPageNumbers = () => {
    const delta = 1; // Cantidad de páginas que mostrar a cada lado de la actual
    const pages: (number | "ellipsis")[] = [];

    // Siempre incluir la primera página
    pages.push(1);

    // Agregar elipsis si es necesario
    if (currentPage - delta > 2) {
      pages.push("ellipsis");
    }

    // Agregar páginas antes y después de la actual
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }

    // Agregar elipsis si es necesario
    if (currentPage + delta < totalPages - 1) {
      pages.push("ellipsis");
    }

    // Siempre incluir la última página si hay más de una
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            href="#"
          />
        </PaginationItem>

        {pageNumbers.map((page, i) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <span className="flex h-9 w-9 items-center justify-center">
                ...
              </span>
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
                href="#"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
            className={
              currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
            }
            href="#"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export { CustomPagination }; 