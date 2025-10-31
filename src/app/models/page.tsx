"use client";

import { DetailedModelCard } from "@/_components/models/DetailedModelCard";
import { api } from "@/trpc/react";

export default function PopularModels() {
  const { data: models } = api.model.getAll.useQuery();

  return (
    <div className="rounded-sm lg:max-w-6xl mx-auto p-4 flex items-center min-h-screen">
      <div className="flex flex-col overflow-y-auto no-scrollbar h-full w-full">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col justify-between">
            <div
              className={
                models?.length === 1
                  ? "flex justify-center py-4"
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4"
              }
            >
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
