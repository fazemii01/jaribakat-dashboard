import React from "react"
import { TableRow, TableCell } from "@/components/Table"

interface TableSkeletonProps {
  columns: number
  rows?: number
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <TableRow key={rIdx} className="animate-pulse">
          <TableCell>
            <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-800" />
          </TableCell>
          <TableCell>
            <div className="space-y-2">
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-28 bg-gray-150 dark:bg-gray-850 rounded" />
            </div>
          </TableCell>
          {Array.from({ length: Math.max(0, columns - 3) }).map((_, cIdx) => (
            <TableCell key={cIdx}>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
            </TableCell>
          ))}
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
