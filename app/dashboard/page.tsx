import { UserButton } from '@clerk/nextjs';
import { getGoodFirstIssues } from '@/lib/github';
import Link from 'next/link';
import { ArrowUpRight, Github, Terminal } from 'lucide-react'; // Ensure you have lucide-react or replace with SVGs

// 💡 FIX: We now use 'await' on the searchParams object itself before accessing any properties.
type DashboardPageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function DashboardPage({ 
  searchParams 
}: DashboardPageProps) {
  
  // 1. Await and destructure the resolved searchParams object. (Fix for Next.js 15)
  const resolvedSearchParams = await searchParams;

  // 2. Determine the language from the URL.
  const language = resolvedSearchParams.lang || 'javascript';
  
  // 3. Fetch issues based on the dynamic language
  const issues = await getGoodFirstIssues(language);
  
  const techStacks = ['javascript', 'python', 'typescript', 'rust', 'go'];

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        
        {/* Header Section */}
        <div className="mb-10 flex items-center justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
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
        
        {/* Modern Filter Bar (Scrollable on mobile) */}
        <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {techStacks.map(stack => {
            const isActive = language === stack;
            return (
              <Link 
                key={stack}
                href={`/dashboard?lang=${stack}`} 
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-zinc-900 text-white shadow-md dark:bg-white dark:text-black' 
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                {/* Simple dot indicator for active state */}
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                {stack.charAt(0).toUpperCase() + stack.slice(1)}
              </Link>
            );
          })}
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
            // 💡 LOGIC: Extract owner and repo
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

                  {/* Title */}
                  <h2 className="mt-4 line-clamp-2 text-lg font-bold leading-tight text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {issue.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {issue.body || 'No description provided. Click to view more details on the challenge page.'}
                  </p>
                </div>
              
                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                    <Link 
                        href={`/solve/${owner}/${repoName}/${issue.number}`} 
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95 dark:bg-white dark:text-black hover:opacity-90"
                    >
                        Start Challenge 
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}