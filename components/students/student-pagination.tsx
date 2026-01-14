"use client"

import { memo } from 'react'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination'

interface StudentPaginationProps {
    currentPage: number
    totalPages: number
    totalElements: number
    pageSize: number
    onPageChange: (page: number, e?: React.MouseEvent) => void
}

export const StudentPagination = memo(({
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    onPageChange
}: StudentPaginationProps) => {
    // Don't show pagination if not enough items
    if (totalElements <= pageSize || totalPages <= 1) {
        return null
    }

    // Show all pages if 7 or fewer
    if (totalPages <= 7) {
        const pageNumbers: number[] = []
        for (let i = 0; i < totalPages; i++) {
            pageNumbers.push(i)
        }
        return (
            <Pagination className="mt-6">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                if (currentPage > 0) {
                                    onPageChange(currentPage - 1, e)
                                }
                            }}
                            className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'hover:scale-[1.02] transition-transform duration-200'}
                        />
                    </PaginationItem>
                    {pageNumbers.map((page) => (
                        <PaginationItem key={page}>
                            <PaginationLink
                                href="#"
                                onClick={(e) => onPageChange(page, e)}
                                isActive={currentPage === page}
                                className="hover:scale-[1.02] transition-transform duration-200"
                            >
                                {page + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                if (currentPage < totalPages - 1) {
                                    onPageChange(currentPage + 1, e)
                                }
                            }}
                            className={currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'hover:scale-[1.02] transition-transform duration-200'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    }

    // Complex pagination for many pages
    const pages: (number | 'ellipsis')[] = []

    if (currentPage <= 3) {
        for (let i = 0; i < Math.min(5, totalPages); i++) {
            pages.push(i)
        }
        if (totalPages > 5) {
            pages.push('ellipsis')
            pages.push(totalPages - 1)
        }
    } else if (currentPage >= totalPages - 4) {
        pages.push(0)
        pages.push('ellipsis')
        for (let i = Math.max(0, totalPages - 5); i < totalPages; i++) {
            pages.push(i)
        }
    } else {
        pages.push(0)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages - 1)
    }

    return (
        <Pagination className="mt-6">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            if (currentPage > 0) {
                                onPageChange(currentPage - 1, e)
                            }
                        }}
                        className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'hover:scale-[1.02] transition-transform duration-200'}
                    />
                </PaginationItem>
                {pages.map((page, index) => (
                    <PaginationItem key={`${page}-${index}`}>
                        {page === 'ellipsis' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href="#"
                                onClick={(e) => onPageChange(page, e)}
                                isActive={currentPage === page}
                                className="hover:scale-[1.02] transition-transform duration-200"
                            >
                                {page + 1}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            if (currentPage < totalPages - 1) {
                                onPageChange(currentPage + 1, e)
                            }
                        }}
                        className={currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'hover:scale-[1.02] transition-transform duration-200'}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}, (prevProps, nextProps) => {
    return (
        prevProps.currentPage === nextProps.currentPage &&
        prevProps.totalPages === nextProps.totalPages &&
        prevProps.totalElements === nextProps.totalElements
    )
})

StudentPagination.displayName = 'StudentPagination'
