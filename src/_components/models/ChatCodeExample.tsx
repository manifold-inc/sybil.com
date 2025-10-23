import { showTargonToast } from "@/_components/TargonToast";
import { env } from "@/env.mjs";
import { api } from "@/trpc/react";
import { copyToClipboard } from "@/utils/utils";
import { Menu } from "@headlessui/react";
import {
  EyeIcon,
  EyeSlashIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  Square2StackIcon as Square2StackIconSolid,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useAuth } from "../providers";

interface ChatCodeExampleProps {
  model: string | null;
}

const languages = [
  { id: "curl", name: "cURL" },
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
] as const;

const LineNumber = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{ fontStyle: "normal", fontFamily: "var(--font-family-poppins)" }}
  >
    {children}
  </span>
);

export const ChatCodeExample = ({ model }: ChatCodeExampleProps) => {
  const auth = useAuth();
  const [selectedLang, setSelectedLang] =
    useState<(typeof languages)[number]["id"]>("curl");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const apiKey = api.apiKey.listApiKeys.useQuery(undefined, {
    enabled: auth.status === "AUTHED",
  });

  const handleCopyClipboard = (copy: string) => {
    void copyToClipboard(copy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
    showTargonToast("Copied to clipboard");
  };
  export const getCodeExample = (lang: typeof selectedLang) => {
    const examples = {
      curl: `curl ${env.NEXT_PUBLIC_CHAT_API}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${showApiKey ? apiKey.data?.[0]?.id : "YOUR_API_KEY"}" \\
  -N \\
  -d '{
    "model": "${model ?? "EXAMPLE_MODEL"}",
    "stream": true,
    "messages": [
      {"role": "system", "content": "You are a helpful programming assistant."},
      {"role": "user", "content": "Write a bubble sort implementation in Python with comments explaining how it works"}
    ],
    "temperature": 0.7,
    "max_tokens": 100,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0
  }'`,
      python: `from openai import OpenAI

client = OpenAI(
    base_url="${env.NEXT_PUBLIC_CHAT_API}/v1",
    api_key="${showApiKey ? apiKey.data?.[0]?.id : "YOUR_API_KEY"}"
)

try:
    response = client.chat.completions.create(
        model="${model}",
        stream=True,
        messages=[
            {"role": "system", "content": "You are a helpful programming assistant."},
            {"role": "user", "content": "Write a bubble sort implementation in Python with comments explaining how it works"}
        ],
        temperature=0.7,
        max_tokens=100,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )
    for chunk in response:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="")
except Exception as e:
    print(f"Error: {e}")`,
      javascript: `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "${env.NEXT_PUBLIC_CHAT_API}/v1",
  apiKey: "${showApiKey ? apiKey.data?.[0]?.id : "YOUR_API_KEY"}"
});

try {
  const stream = await client.chat.completions.create({
    model: "${model}",
    stream: true,
    messages: [
      { role: "system", content: "You are a helpful programming assistant." },
      { role: "user", content: "Write a bubble sort implementation in JavaScript with comments explaining how it works" }
    ],
    temperature: 0.7,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  });
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    process.stdout.write(content);
  }
} catch (error) {
  console.error('Error:', error);
}`,
      typescript: `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "${env.NEXT_PUBLIC_CHAT_API}/v1",
  apiKey: "${showApiKey ? apiKey.data?.[0]?.id : "YOUR_API_KEY"}",
  dangerouslyAllowBrowser: true
});

const chat = async () => {
  try {
    const stream = await client.chat.completions.create({
      model: "${model}",
      stream: true,
      messages: [
        { role: "system", content: "You are a helpful programming assistant." },
        { role: "user", content: "Write a bubble sort implementation in TypeScript with comments explaining how it works" }
      ],
      temperature: 0.7,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      process.stdout.write(content);
    }
  } catch (error) { console.error('Error:', error); }
};

void chat();`,
    };

    return examples[lang];
  };

  const getPrismLanguage = (lang: typeof selectedLang) => {
    const mapping = {
      curl: "bash",
      python: "python",
      javascript: "javascript",
      typescript: "typescript",
    };
    return mapping[lang];
  };

  if (!model) {
    return (
      <div className="no-scrollbar h-80 w-full overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
          <div className="text-center">
            <h3 className="text-mf-ash-700 text-lg font-semibold lg:text-xl">
              Select a Model
            </h3>
            <p className="text-mf-ash-500 mt-1 text-sm lg:text-base">
              Choose a model from the dropdown above to see code examples
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-poppins overflow-x-hidden h-80 w-full">
      <div className="bg-mf-card-dark rounded-md h-full w-full flex flex-col border border-mf-metal-300">
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Show API Key, Copy */}
          <div className="flex items-center gap-1.5">
            <p className="font-saira">Chat</p>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              disabled={!apiKey.data?.[0]?.id}
              className={`rounded-md hover:opacity-50 ${
                !apiKey.data?.[0]?.id ? "opacity-50" : "cursor-pointer"
              }`}
            >
              {showApiKey ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => handleCopyClipboard(getCodeExample(selectedLang))}
              className="cursor-pointer rounded-md hover:opacity-50"
            >
              {isCopied ? (
                <Square2StackIconSolid className="h-4 w-4" />
              ) : (
                <Square2StackIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Language Selection */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id)}
                  className={`cursor-pointer text-xs ${
                    selectedLang === lang.id
                      ? "text-mf-sally-500"
                      : "opacity-50 hover:opacity-70"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
          <Menu as="div" className="relative inline-block sm:hidden">
            <Menu.Button className="inline-flex items-center justify-center outline-none mt-1 hover:bg-mf-ash-300 rounded-md cursor-pointer text-mf-edge-500">
              <p className="text-xs px-1 text-mf-sally-500">
                {languages.find((lang) => lang.id === selectedLang)?.name}
              </p>
              <ChevronDownIcon className="h-4 w-4" />
            </Menu.Button>
            <Menu.Items className="absolute z-10 w-32 -translate-x-16 mt-1 rounded-md border outline-none bg-mf-card-dark border-mf-ash-300">
              {languages.map((lang) => (
                <Menu.Item key={lang.id}>
                  <button
                    onClick={() => setSelectedLang(lang.id)}
                    className={`flex text-left px-4 py-2 cursor-pointer text-xs ${
                      selectedLang === lang.id
                        ? "text-mf-sally-500"
                        : "opacity-50 hover:opacity-70"
                    }`}
                  >
                    {lang.name}
                  </button>
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
        </div>

        {/* Code Example */}
        <div className="overflow-y-auto text-xs no-scrollbar">
          <SyntaxHighlighter
            language={getPrismLanguage(selectedLang)}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: "0.5rem",
              background: "transparent",
              lineHeight: "1.5",
            }}
            codeTagProps={{
              style: {
                fontFamily: "var(--font-family-poppins)",
              },
              className: "linenumber",
            }}
            showLineNumbers
            lineNumberStyle={{
              minWidth: "3em",
              paddingRight: "1em",
              color: "#484848",
              textAlign: "right",
              userSelect: "none",
            }}
            components={{
              LineNumber,
            }}
          >
            {getCodeExample(selectedLang)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};
