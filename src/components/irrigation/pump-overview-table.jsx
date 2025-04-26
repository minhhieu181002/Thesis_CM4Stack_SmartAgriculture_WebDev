import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getStatusInfo } from "@/utils/getStatusInfo";

export function PumpOverviewTable({ pumps }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Pump Overview
      </h2>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <Table className="min-w-full divide-y divide-gray-200 pump-table">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pump Name
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Area
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Status
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mode
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule (Start - End)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {pumps.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-4 text-gray-500"
                >
                  No pumps defined.
                </TableCell>
              </TableRow>
            ) : (
              pumps.map((pump) => {
                const statusInfo = getStatusInfo(pump);
                const scheduleText = pump.schedule
                  ? `${pump.schedule.startTime} - ${pump.schedule.endTime}`
                  : "Not Set";
                return (
                  <TableRow key={pump.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pump.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pump.area}
                    </TableCell>
                    <TableCell
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${statusInfo.colorClass}`}
                    >
                      {statusInfo.text}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pump.mode}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scheduleText}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
