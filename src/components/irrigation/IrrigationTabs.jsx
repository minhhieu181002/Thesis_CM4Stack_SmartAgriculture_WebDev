import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { List } from "lucide-react";

export function IrrigationTabs({
  areaNames,
  activeTab,
  onTabChange,
  overviewContent,
  areaContents,
}) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList className="bg-transparent flex space-x-6 overflow-x-auto border-0 border-b border-gray-200">
        <TabsTrigger
          value="overview"
          className={`overview-tab whitespace-nowrap py-3 px-1 font-medium text-sm flex items-center border-0 border-b-2 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
            activeTab === "overview"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <List className="mr-1 h-4 w-4" /> Overview
        </TabsTrigger>
        {areaNames.map((area) => (
          <TabsTrigger
            key={area}
            value={area}
            className={`tab-button area-tab whitespace-nowrap py-3 px-1 font-medium text-sm border-0 border-b-2 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
              activeTab === area
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {area}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* TabsContent components */}
      <TabsContent value="overview" className="mt-4 border-0 rounded-none p-0">
        {overviewContent}
      </TabsContent>

      {areaNames.map((area, index) => (
        <TabsContent
          key={area}
          value={area}
          className="mt-4 border-0 rounded-none p-0"
        >
          {areaContents[index]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
