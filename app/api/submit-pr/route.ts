import { NextResponse } from 'next/server';
import { octokit } from '@/lib/github';

export async function POST(req: Request) {
  try {
    const { owner, repo, issueNumber, filePath, newContent } = await req.json();

    if (!owner || !repo || !issueNumber || !filePath || !newContent) {
      return NextResponse.json({ success: false, message: 'Missing required PR data.' }, { status: 400 });
    }

    const branchName = `gitgud-fix-${issueNumber}-${Date.now()}`;
    const commitMessage = `fix(issue-${issueNumber}): update ${filePath}`;
    const prTitle = `Fix for #${issueNumber}: Updated ${filePath}`;
    const prBody = `🤖 Solution automatically submitted by GitGud. Please review the changes for issue #${issueNumber}.`;
    
    // 1. Get the SHA of the base branch (usually 'main')
    // Note: If the repo uses 'master', this might fail. We assume 'main' for now.
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;

    const { data: baseRef } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const baseSha = baseRef.object.sha;

    // 2. Create a new branch off the base branch
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });
    
    // 3. Get the SHA of the file we are modifying (required to update it)
    // We use a try/catch in case the file is new, but usually it exists.
    let fileSha;
    try {
        const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branchName, // Look at the new branch
        }) as any;
        fileSha = fileData.sha;
    } catch (e) {
        // File might not exist, which is fine for new files
    }
    
    // 4. Create/Update the file in the new branch
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: commitMessage,
      content: Buffer.from(newContent, 'utf-8').toString('base64'), // Base64 encode
      sha: fileSha, // omit if creating a new file
      branch: branchName,
    });

    // 5. Create the Pull Request
    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: prTitle,
      head: branchName, 
      base: defaultBranch,
      body: prBody,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Pull Request created successfully!', 
      prUrl: pr.html_url 
    });

  } catch (error) {
    console.error('PR Submission Failed:', error);
    const errorMessage = (error as { message?: string })?.message || 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      message: `Failed to create PR: ${errorMessage}` 
    }, { status: 500 });
  }
}