import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { PostData, getPostVoices, getPrimaryVoice, formatDate } from './post-utils';

const postsDirectory = path.join(process.cwd(), 'content/daily');

// Re-export utilities for server-side use
export type { PostData };
export { getPostVoices, getPrimaryVoice, formatDate };

export async function getAllPosts(): Promise<PostData[]> {
  try {
    // Check if directory exists
    await fs.access(postsDirectory);
    
    const fileNames = await fs.readdir(postsDirectory);
    const markdownFiles = fileNames.filter(name => name.endsWith('.md'));

    const allPostsData = await Promise.all(
      markdownFiles.map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = await fs.readFile(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        return {
          slug,
          title: matterResult.data.title || 'Untitled',
          date: matterResult.data.date || '',
          model: matterResult.data.model,
          voice: matterResult.data.voice,
          voices: matterResult.data.voices,
          excerpt: matterResult.data.excerpt,
          tags: matterResult.data.tags,
          category: matterResult.data.category,
          content: matterResult.content,
        } as PostData;
      })
    );

    // Sort posts by date (newest first)
    return allPostsData.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error reading posts directory:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = await fs.readFile(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
      .use(html)
      .process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
      slug,
      contentHtml,
      title: matterResult.data.title || 'Untitled',
      date: matterResult.data.date || '',
      model: matterResult.data.model,
      voice: matterResult.data.voice,
      voices: matterResult.data.voices,
      excerpt: matterResult.data.excerpt,
      tags: matterResult.data.tags,
      category: matterResult.data.category,
      content: matterResult.content,
    } as PostData;
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
} 