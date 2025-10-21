"use client";

import { DetailedModelCard } from "@/_components/models/DetailedModelCard";
import { api } from "@/trpc/react";

export default function PopularModels() {
  const { data: models } = api.model.getAll.useQuery();

  return (
    <div className="rounded-sm lg:max-w-6xl mx-auto p-4 min-h-screen flex items-center">
      <div className="flex flex-col overflow-y-auto no-scrollbar h-full w-full">
        {/* All Models Section */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
              {models?.map((model) => (
                <DetailedModelCard
                  key={model.id}
                  name={model.name ?? ""}
                  description={model.description ?? ""}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
