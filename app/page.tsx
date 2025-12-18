"use client";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export default function Home() {
  return (
    <HeroHighlight containerClassName="h-screen flex items-center justify-center">
      <div className="z-20 flex max-w-4xl flex-col items-center gap-6 px-4 text-center">
        
        {/* Badge / Small Label */}
        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white/10 px-3 py-1 text-sm font-medium text-zinc-800 backdrop-blur-sm dark:border-zinc-800 dark:text-zinc-200">
          <span>🚀 GitGud is now in beta</span>
        </div>

        {/* Main Headline */}
        {/* FIX: Changed leading-tight to leading-snug and added a line break */}
        <h1 className="text-4xl font-bold leading-snug tracking-tight text-black dark:text-white md:text-5xl lg:text-6xl lg:leading-tight">
          Solve GitHub Issues with your personal{" "}
          {/* Force the Highlight to a new line on medium screens and up for cleaner look */}
          <br className="hidden md:block" />
          <Highlight className="text-black dark:text-white">
            AI Coding Mentor
          </Highlight>
        </h1>

        {/* Dynamic Description */}
        <div className="max-w-2xl text-base font-normal text-zinc-600 dark:text-zinc-400 md:text-lg">
          <TextGenerateEffect
            words="Instantly fetch open source issues, navigate the codebase, and get guided solutions directly within your editor. Persistent chat history keeps your progress safe."
            className="text-center font-normal text-zinc-600 dark:text-zinc-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
          <a href="/dashboard">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="flex h-12 items-center cursor-pointer justify-center gap-2 bg-white px-8 text-black dark:bg-black dark:text-white"
            >
              <span>Start Solving</span>
            </HoverBorderGradient>
          </a>

          <a
            href="https://github.com/mahak0711/GitGud"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-transparent px-8 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900 sm:w-auto"
          >
             {/* Simple GitHub Icon SVG */}
            <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </HeroHighlight>
  );
}