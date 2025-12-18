import { UserButton } from '@clerk/nextjs';
import { getGoodFirstIssues } from '@/lib/github'; 
import Link from 'next/link';
import { ArrowUpRight, Github, Terminal, ChevronLeft, ChevronRight } from 'lucide-react'; 
import { redirect } from 'next/navigation'; // 🎯 CRITICAL: Import Next.js redirect function
import { StartChallengeButton } from '@/components/StartChallengeButton';
// Define the maximum number of issues per page (GitHub Search API default max is 30)
const ISSUES_PER_PAGE = 15;

type DashboardPageProps = {
  searchParams: Promise<{ lang?: string; page?: string }>;
};

export default async function DashboardPage({ 
  searchParams 
}: DashboardPageProps) {
  
  const resolvedSearchParams = await searchParams;

  // 1. DETERMINE LANGUAGE AND PAGE NUMBER
  const language = resolvedSearchParams.lang || 'javascript';
  const currentPage = parseInt(resolvedSearchParams.page || '1'); 
  
  // 2. FETCH ISSUES (Requires backend to pass 'page' to GitHub API)
  const issues = await getGoodFirstIssues(language, currentPage); 
  
  // 🎯 CRITICAL FIX: REDIRECT IF LANDING ON AN EMPTY PAGE BEYOND PAGE 1
  if (issues.length === 0 && currentPage > 1) {
    // If the issues list is empty, and we are not on the first page, 
    // it means the requested page doesn't exist. Redirect back to the last valid page (currentPage - 1).
    const previousPageLink = `/dashboard?lang=${language.toLowerCase()}&page=${currentPage - 1}`;
    redirect(previousPageLink);
  }
  // --- End Critical Fix ---
  
  const techStacks = [
    'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++',
    'c#', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'haskell', 'elixir', 'dart'
  ];

  // Logic for pagination controls
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
        
        {/* Filter Section (Tag Cloud) */}
        <div className="mb-10">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                Filter by Technology
            </h3>
            <div className="flex flex-wrap gap-2">
                {techStacks.map(stack => {
                    const isActive = language === stack;
                    return (
                    <Link 
                        key={stack}
                        // Reset page to 1 when changing stack
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
          {issues.length === 0 && (
            <div className="col-span-full py-20 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
                    <Terminal className="h-8 w-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-medium">No issues found for {language}</h3>
                <p className="text-zinc-500">Try selecting a different tech stack above.</p>
            </div>
          )}
          
          {issues.map(issue => {
            const [owner, repoName] = issue.repo.split('/'); 

            return (
              <div 
                key={issue.id} 
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        <Github className="h-4 w-4" />
                        <span>{owner}</span>
                        <span className="text-zinc-300 dark:text-zinc-700">/</span>
                        <span className="text-zinc-900 dark:text-zinc-200">{repoName}</span>
                    </div>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        #{issue.number}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <h2 className="mt-4 line-clamp-2 text-lg font-bold leading-tight text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {issue.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {issue.body || 'No description provided. Click to view more details on the challenge page.'}
                  </p>
                </div>
              
                {/* Footer Action */}
               <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                    <StartChallengeButton 
                        owner={owner} 
                        repo={repoName} 
                        number={issue.number} 
                    />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Pagination Footer */}
        <div className="mt-12 flex items-center justify-between">
            <Link 
                href={hasPreviousPage ? getPaginationLink(currentPage - 1) : '#'}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    hasPreviousPage 
                        ? 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                        : 'border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900'
                }`}
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Link>

            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Page {currentPage}
            </span>

            <Link 
                href={hasNextPage ? getPaginationLink(currentPage + 1) : '#'}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    hasNextPage 
                        ? 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                        : 'border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900'
                }`}
            >
                Next
                <ChevronRight className="h-4 w-4" />
            </Link>
        </div>

      </div>
    </div>
  );
}