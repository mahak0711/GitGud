import { NextResponse } from 'next/server';
import { octokit } from '@/lib/github';

export async function POST(req: Request) {
  try {
    const { owner, repo, path } = await req.json();

    if (!owner || !repo || !path) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }

    // Fetch the file content from GitHub
    // Note: GitHub API returns content in Base64 encoding
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    }) as any; // Cast to any because the type union is complex (can be array or object)

    if (!data.content) {
      return NextResponse.json({ success: false, message: 'File is empty or not a valid text file.' });
    }

    // Decode Base64 to UTF-8 string
    const content = Buffer.from(data.content, 'base64').toString('utf8');

    return NextResponse.json({ success: true, content });

  } catch (error) {
    console.error('Get File Content Failed:', error);
    return NextResponse.json({ success: false, message: 'File not found on GitHub.' }, { status: 404 });
  }
}