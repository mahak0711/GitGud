import { Octokit } from "octokit";


export const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });

/**
 * Fetches 'good first issues' from GitHub based on a specified language.
 * @param language The programming language to filter issues by (e.g., 'javascript').
 * @returns An array of simplified issue objects.
 */

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export async function getGoodFirstIssues(language: string) {
  const q = `label:"good first issue" language:${language} state:open no:assignee is:issue`;
  
  try {
    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q,
      sort: "updated",
      order: "desc",
      per_page: 20,
    });

    return data.items.map(item => ({
      id: item.id,
      title: item.title,
      repo: item.repository_url.split('/').slice(-2).join('/'),
      url: item.html_url,
      body: item.body,
      comments: item.comments,
      language: language,
    }));
  } 
  catch (error) {
    console.error("GitHub API Error:", error);
    return []; //to avoid any api failure
  }
}