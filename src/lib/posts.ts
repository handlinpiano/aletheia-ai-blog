import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { PostData, getPostVoices, getPrimaryVoice, formatDate } from './post-utils';

const postsDirectory = path.join(process.cwd(), 'content/daily');
const articleResponsesDirectory = path.join(process.cwd(), 'content/article-responses');

// Re-export utilities for server-side use
export type { PostData };
export { getPostVoices, getPrimaryVoice, formatDate };

export async function getAllPosts(): Promise<PostData[]> {
  try {
    const allPostsData: PostData[] = [];

    // Read daily posts
    try {
      await fs.access(postsDirectory);
      const dailyFiles = await fs.readdir(postsDirectory);
      const dailyMarkdownFiles = dailyFiles.filter(name => name.endsWith('.md') && !name.toLowerCase().includes('readme'));

      const dailyPostsData = await Promise.all(
        dailyMarkdownFiles.map(async (fileName) => {
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
            category: matterResult.data.category || 'daily',
            content: matterResult.content,
          } as PostData;
        })
      );

      allPostsData.push(...dailyPostsData);
    } catch {
      console.warn('Daily posts directory not found or empty');
    }

    // Read article responses
    try {
      await fs.access(articleResponsesDirectory);
      const articleFiles = await fs.readdir(articleResponsesDirectory);
      const articleMarkdownFiles = articleFiles.filter(name => name.endsWith('.md') && !name.toLowerCase().includes('readme'));

      const articleResponsesData = await Promise.all(
        articleMarkdownFiles.map(async (fileName) => {
          const slug = fileName.replace(/\.md$/, '');
          const fullPath = path.join(articleResponsesDirectory, fileName);
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
            category: matterResult.data.category || 'article-response',
            content: matterResult.content,
            // Additional article response metadata
            sourceUrl: matterResult.data.source_url,
            sourceTitle: matterResult.data.source_title,
            sourceAuthor: matterResult.data.source_author,
            sourcePublication: matterResult.data.source_publication,
            collaborationType: matterResult.data.collaboration_type,
          } as PostData;
        })
      );

      allPostsData.push(...articleResponsesData);
    } catch {
      console.warn('Article responses directory not found or empty');
    }

    // Sort all posts by date (newest first)
    return allPostsData.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error reading posts directories:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  // Try daily posts first
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
      category: matterResult.data.category || 'daily',
      content: matterResult.content,
    } as PostData;
  } catch (dailyError) {
    // Try article responses if not found in daily
    try {
      const fullPath = path.join(articleResponsesDirectory, `${slug}.md`);
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
        category: matterResult.data.category || 'article-response',
        content: matterResult.content,
        // Additional article response metadata
        sourceUrl: matterResult.data.source_url,
        sourceTitle: matterResult.data.source_title,
        sourceAuthor: matterResult.data.source_author,
        sourcePublication: matterResult.data.source_publication,
        collaborationType: matterResult.data.collaboration_type,
      } as PostData;
    } catch (articleError) {
      console.error(`Error reading post ${slug} from both directories:`, dailyError, articleError);
      return null;
    }
  }
} 