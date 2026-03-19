"use client";

interface Props {
  message?: string;
}

export function Loading({ message = "Loading…" }: Props) {
  return (
    <div className="flex items-center justify-center h-64 gap-3 text-[#5a5480] font-mono text-[12px]">
      <span className="w-[5px] h-[5px] rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-[5px] h-[5px] rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-[5px] h-[5px] rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
      <span className="ml-2">{message}</span>
    </div>
  );
}
