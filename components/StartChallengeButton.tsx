"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowUpRight } from "lucide-react";

interface Props {
  owner: string;
  repo: string;
  number: number;
}

export function StartChallengeButton({ owner, repo, number }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(() => {
      router.push(`/solve/${owner}/${repo}/${number}`);
    });
  };

  return (
    <button 
      onClick={handleStart}
      disabled={isPending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white transition-all active:scale-95 dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <>
          Entering Workspace...
          <Loader2 className="h-4 w-4 animate-spin" />
        </>
      ) : (
        <>
          Start Challenge 
          <ArrowUpRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}