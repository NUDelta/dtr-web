'use server';

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import RSS from 'rss';
import annualLetters from '@/lib/annual-letters';
import { feedFileName, siteUrl } from '@/lib/consts';

const generateRssFeed = async (): Promise<void> => {
  const feedOptions: RSS.FeedOptions = {
    title: 'DTR Annual Letters RSS Feed',
    description: 'Read the DTR annual letters and explore resources on mentoring and learning.',
    feed_url: `${siteUrl}/${feedFileName}`,
    site_url: siteUrl,
    language: 'en',
    copyright: `All rights reserved ${new Date().getFullYear()} by DTR`,
    pubDate: new Date(),
    generator: 'Next.js + RSS for Node provided by DTR',
  };

  let feed: RSS;
  try {
    feed = new RSS(feedOptions);

    for (const letter of annualLetters) {
      feed.item({
        title: letter.name,
        description: letter.description,
        url: `${siteUrl}${letter.link}`,
        date: letter.datePublished,
        author: 'Haoqi Zhang',
      });
    }
  }
  catch (error) {
    if (error instanceof Error) {
      console.error('Error creating RSS feed:', error.message);
    }
    else {
      console.error('Unexpected error:', error);
    }
    return;
  }

  try {
    const outputPath = path.join(process.cwd(), 'public', feedFileName);
    fs.writeFileSync(outputPath, feed.xml({ indent: true }), 'utf8');
    // eslint-disable-next-line no-console
    console.info(`\nRSS feed generated at /${feedFileName} 🎉`);
  }
  catch (writeError) {
    if (writeError instanceof Error) {
      console.error('Error writing RSS feed file:', writeError.message);
    }
    else {
      console.error('Unexpected error while writing file:', writeError);
    }
  }
};

export default generateRssFeed;
