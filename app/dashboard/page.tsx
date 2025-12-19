
import { UserButton } from '@clerk/nextjs';
import { getGoodFirstIssues } from '@/lib/github'; 
import Link from 'next/link';
import { ArrowUpRight, Github, Terminal, ChevronLeft, ChevronRight } from 'lucide-react'; 
import { redirect } from 'next/navigation';
import { StartChallengeButton } from '@/components/StartChallengeButton';

const ISSUES_PER_PAGE = 15;

type DashboardPageProps = {
  searchParams: Promise<{ lang?: string; page?: string }>;
};

export default async function DashboardPage({ 
  searchParams 
}: DashboardPageProps) {
  
  const resolvedSearchParams = await searchParams;
  const language = resolvedSearchParams.lang || 'javascript';
  const currentPage = parseInt(resolvedSearchParams.page || '1'); 
  
  const issues = await getGoodFirstIssues(language, currentPage); 
  
  if (issues.length === 0 && currentPage > 1) {
    const previousPageLink = `/dashboard?lang=${language.toLowerCase()}&page=${currentPage - 1}`;
    redirect(previousPageLink);
  }
  
  const techStacks = [
    'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++',
    'c#', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'haskell', 'elixir', 'dart'
  ];

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = issues.length === ISSUES_PER_PAGE; 

  const getPaginationLink = (page: number) => 
    `/dashboard?lang=${language.toLowerCase()}&page=${page}`;

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-center dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Issue Feed
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Curated "Good First Issues" for{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {language.charAt(0).toUpperCase() + language.slice(1)}
              </span>
            </p>
          </div>
          <UserButton 
            afterSignOutUrl="/" 
            appearance={{
                elements: {
                    avatarBox: "h-10 w-10 border border-zinc-200 dark:border-zinc-800"
                }
            }}
          />
        </div>
        
        {/* Tech Stack Filters */}
        <div className="mb-10">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Filter by Technology
            </h3>
            <div className="flex flex-wrap gap-2">
                {techStacks.map(stack => {
                    const isActive = language === stack;
                    return (
                    <Link 
                        key={stack}
                        href={`/dashboard?lang=${stack.toLowerCase()}&page=1`} 
                        className={`
                            flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all
                            ${isActive 
                                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black' 
                                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'
                            }
                        `}
                    >
                        {stack.charAt(0).toUpperCase() + stack.slice(1)}
                    </Link>
                    );
                })}
            </div>
        </div>
        
        {/* Issues Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {issues.length === 0 ? (
            <div className="col-span-full py-20 text-center">
                <Terminal className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                <h3 className="text-lg font-medium">No issues found</h3>
                <p className="text-zinc-500">Try another language.</p>
            </div>
          ) : (
            issues.map(issue => {
              const [owner, repoName] = issue.repo.split('/'); 

              return (
                <div 
                  key={issue.id} 
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-xl hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
                >
                  <div className="flex-grow">
                    {/* Repository Path */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                          <Github className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[120px]">{owner} / {repoName}</span>
                      </div>
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          #{issue.number}
                      </span>
                    </div>

                    {/* Issue Title */}
                    <h2 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors">
                      {issue.title}
                    </h2>

                    {/* 🎯 STRUCTURED DESCRIPTION BLOCK */}
                    <div className="relative mt-4">
                      <div className="relative overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-800/30">
                        {/* Decorative Quote Bar */}
                        <div className="absolute left-0 top-0 h-full w-1 bg-zinc-200 dark:bg-zinc-700" />
                        
                        <p className="line-clamp-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 italic">
                          {issue.body ? issue.body.replace(/[#*`]/g, '').trim() : 'Explore this repository to understand the requirements for this contribution challenge.'}
                        </p>

                        {/* Fading Edge */}
                        <div className="absolute bottom-0 left-0 h-6 w-full bg-gradient-to-t from-zinc-50/80 to-transparent dark:from-zinc-900/40" />
                      </div>
                    </div>
                  </div>
                
                  {/* Action Button */}
                  <div className="mt-6">
                      <StartChallengeButton 
                          owner={owner} 
                          repo={repoName} 
                          number={issue.number} 
                      />
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Pagination Footer */}
        <div className="mt-12 flex items-center justify-between border-t border-zinc-100 pt-8 dark:border-zinc-800">
            <Link 
                href={hasPreviousPage ? getPaginationLink(currentPage - 1) : '#'}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    hasPreviousPage 
                        ? 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                        : 'opacity-30 cursor-not-allowed'
                }`}
            >
                <ChevronLeft className="h-4 w-4" /> Previous
            </Link>

            <div className="text-xs font-mono text-zinc-500">
                PAGE <span className="text-zinc-900 dark:text-white font-bold">{currentPage}</span>
            </div>

            <Link 
                href={hasNextPage ? getPaginationLink(currentPage + 1) : '#'}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    hasNextPage 
                        ? 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                        : 'opacity-30 cursor-not-allowed'
                }`}
            >
                Next <ChevronRight className="h-4 w-4" />
            </Link>
        </div>
      </div>
    </div>
  );
}