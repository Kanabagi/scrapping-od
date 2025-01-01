import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const url = `https://otakudesu.cloud/anime/${slug}/`;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('.jdlrx h1').text().trim();
    const imageUrl = $('.fotoanime img').attr('src') || '';
    const details: Record<string, string> = {};

    // Extract details
    $('.infozingle p').each((_, el) => {
      const key = $(el)
        .find('b')
        .text()
        .trim()
        .replace(':', '')
        .toLowerCase()
        .replace(/\s+/g, ''); // Convert to lowercase and remove spaces
      const value = $(el).text().replace(`${key}:`, '').trim();
      details[key] = value;
    });

    // Separate episodes into batch, single, and lengkap
    const batchEpisodes: { title: string; url: string; date: string }[] = [];
    const singleEpisodes: { title: string; url: string; date: string }[] = [];
    const lengkapEpisodes: { title: string; url: string; date: string }[] = [];

    $('.episodelist ul li').each((_, el) => {
      const title = $(el).find('a').text().trim();
      const url = $(el).find('a').attr('href') || '';
      const date = $(el).find('.zeebr').text().trim();

      // Categorize episodes
      if (title.toLowerCase().includes('batch')) {
        batchEpisodes.push({ title, url, date });
      } else if (
        title.toLowerCase().includes('sub indo') &&
        title.toLowerCase().includes('end')
      ) {
        lengkapEpisodes.push({ title, url, date });
      } else {
        singleEpisodes.push({ title, url, date });
      }
    });

    return NextResponse.json({
      title,
      imageUrl,
      details,
      batch: batchEpisodes,
      single: singleEpisodes,
      lengkap: lengkapEpisodes,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
