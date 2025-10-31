"use client";

import { ChatCodeExample } from "@/_components/models/ChatCodeExample";
import { CompletionCodeExample } from "@/_components/models/CompletionCodeExample";
import { ModelCosts } from "@/_components/models/ModelCosts";
import { ModelTags } from "@/_components/models/ModelTags";
import { useAuth } from "@/_components/providers";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";

export default function ModelPage() {
  const auth = useAuth();
  const params = useParams();
  const modelOrg = params.model?.[0] ?? "";
  const modelName = params.model?.[1] ?? "";
  const { data: model } = api.model.getByNames.useQuery(
    { names: [`${modelOrg}/${modelName}`] },
    { enabled: auth.status !== "LOADING" }
  );

  return (
    <div className="rounded-sm lg:max-w-6xl mx-auto p-4 min-h-screen flex items-center sm:py-0 py-24">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-mf-card-dark flex flex-grow flex-col rounded-md h-full min-h-32 border border-mf-metal-300">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-1">
                <p className="font-saira text-lg">{modelName}</p>
              </div>

              <div className="bg-mf-card-dark flex items-center gap-1.5 rounded-lg px-4 py-0.5">
                <div className="bg-mf-sybil-500 h-1 w-1 rounded-full"></div>
                <p className="text-xs">
                  {model?.[0]?.enabled ? "Live" : "Lease"}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 px-4 py-2">
              <p className="opacity-70 text-xs">
                {model?.[0]?.description ?? ""}
              </p>
            </div>
          </div>
          <div className="flex flex-grow flex-col h-full gap-4">
            <ModelTags org={modelOrg} name={modelName} />
            <ModelCosts modelName={`${modelOrg}/${modelName}`} />
          </div>
          <ChatCodeExample model={`${modelOrg}/${modelName}`} />
          <CompletionCodeExample model={`${modelOrg}/${modelName}`} />
        </div>
      </div>
    </div>
  );
}
