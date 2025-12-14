import { NextResponse } from 'next/server';
import { octokit } from '@/lib/github';

export async function POST(req: Request) {
  try {
    const { owner, repo, path = '' } = await req.json();

    // Fetch content from GitHub
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    // If data is NOT an array, it means it's a single file, not a folder.
    if (!Array.isArray(data)) {
      return NextResponse.json({ success: false, message: 'Path is not a directory' }, { status: 400 });
    }

    // Format and Sort the data
    const items = data.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type, // 'file' or 'dir'
    }));

    // Sort: Folders first, then files
    items.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'dir' ? -1 : 1;
    });

    return NextResponse.json({ success: true, items });

  } catch (error) {
    console.error('Repo Tree Fetch Failed:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch repository content' }, { status: 500 });
  }
}