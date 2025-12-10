import { UserButton } from '@clerk/nextjs';
import { getGoodFirstIssues } from '@/lib/github'; 

// 💡 NEW TYPE DEFINITION: Since Next.js 15+, dynamic props are wrapped in a Promise.
// We must define the type of searchParams as a Promise resolving to the actual object.
type DashboardPageProps = {
  searchParams: Promise<{ lang?: string }>;
};

// 💡 FIX: We now use 'await' on the searchParams object itself before accessing any properties.
export default async function DashboardPage({ 
  searchParams 
}: DashboardPageProps) {
  
  // 1. Await and destructure the resolved searchParams object.
  const resolvedSearchParams = await searchParams;

  // 2. Determine the language from the URL. This access is now safe.
  const language = resolvedSearchParams.lang || 'javascript';
  
  // 3. Fetch issues based on the dynamic language
  const issues = await getGoodFirstIssues(language);
  
  const techStacks = ['javascript', 'python', 'typescript', 'rust', 'go'];
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-800">
          🎯 Issue Feed: {language.toUpperCase()}
        </h1>
        <UserButton afterSignOutUrl="/" />
      </div>
      
      {/* Dynamic Filter Bar */}
      <div className="flex gap-4 p-2 bg-gray-50 rounded-lg">
        {techStacks.map(stack => (
          <a 
            key={stack}
            href={`/dashboard?lang=${stack}`} 
            className={`p-2 rounded-lg font-medium transition ${
              language === stack ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {stack.charAt(0).toUpperCase() + stack.slice(1)}
          </a>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.length === 0 && <p className="text-gray-600">No issues found for {language}. Try a different stack or check your token.</p>}
        
        {issues.map(issue => (
          <div key={issue.id} className="p-6 border rounded-xl shadow-lg hover:shadow-2xl transition duration-300 bg-white">
            <h2 className="text-xl font-bold text-blue-700">{issue.title}</h2>
            <a className="text-sm text-gray-500 mt-1">Repo: {issue.repo}</a>
            <p className="mt-4 text-gray-700 line-clamp-3">{issue.body || 'No description provided.'}</p>
          
          {/* this will go to monaco editor */}
            <a 
              href={`/solve/${issue.id}`} 
              className="mt-4 inline-block px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
            >
              Start Challenge →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}