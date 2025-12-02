import { useState } from "react";

export function usePagination(totalItems: number, itemsPerPage: number = 5) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const changePage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        changePage
    };
}
