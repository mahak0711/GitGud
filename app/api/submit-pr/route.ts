import { NextResponse } from 'next/server';
import { octokit } from '@/lib/github';

export async function POST(req: Request) {
  try {
    const { owner, repo, issueNumber, filePath, newContent } = await req.json();

    // 1. Get the current authenticated user
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const currentUser = user.login;

    // 2. Check if we have WRITE access to the target repo
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const hasWriteAccess = repoData.permissions?.push;
    const defaultBranch = repoData.default_branch;

    let headOwner = owner; // Where we will push the code
    let headRepo = repo;

    // 3. 💡 FORKING LOGIC: If we can't write, we MUST fork
    if (!hasWriteAccess) {
        console.log(`No write access to ${owner}/${repo}. Forking to ${currentUser}...`);
        
        // Create (or get existing) Fork
        await octokit.rest.repos.createFork({ owner, repo });
        
        // Update target to be OUR fork
        headOwner = currentUser;
        headRepo = repo; // The repo name usually stays the same

        // 🚨 CRITICAL: Forks take a few seconds to be ready. 
        // In a real production app, we would poll. For now, we wait 2s.
        await new Promise(r => setTimeout(r, 2000));
    }

    // 4. Create the Branch (on the HEAD repo - either ours or theirs)
    const branchName = `gitgud-fix-${issueNumber}-${Date.now()}`;
    const { data: baseRef } = await octokit.rest.git.getRef({
      owner: headOwner, // Get ref from WHERE WE ARE PUSHING
      repo: headRepo,
      ref: `heads/${defaultBranch}`, // Usually checking out from main
    });

    await octokit.rest.git.createRef({
      owner: headOwner,
      repo: headRepo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });
    
    // 5. Update the File
    // Get existing file SHA (if it exists in the fork/repo)
    let fileSha;
    try {
        const { data: fileData } = await octokit.rest.repos.getContent({
            owner: headOwner,
            repo: headRepo,
            path: filePath,
            ref: branchName,
        }) as any;
        fileSha = fileData.sha;
    } catch (e) { /* File new? */ }
    
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: headOwner,
      repo: headRepo,
      path: filePath,
      message: `fix(issue-${issueNumber}): update ${filePath}`,
      content: Buffer.from(newContent, 'utf-8').toString('base64'),
      sha: fileSha,
      branch: branchName,
    });

    // 6. Submit the Pull Request
    // PR goes FROM headOwner:branch TO owner:defaultBranch
    const { data: pr } = await octokit.rest.pulls.create({
      owner, // The ORIGINAL owner (e.g., code-charity)
      repo,  // The ORIGINAL repo
      title: `Fix for #${issueNumber}: Updated ${filePath}`,
      head: `${headOwner}:${branchName}`, // Cross-repo format: "username:branch"
      base: defaultBranch,
      body: `🤖 Fix submitted via GitGud.`,
    });

    return NextResponse.json({ success: true, prUrl: pr.html_url });

  } catch (error) {
    console.error('PR Submission Failed:', error);
    const msg = (error as any).response?.data?.message || (error as any).message;
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}