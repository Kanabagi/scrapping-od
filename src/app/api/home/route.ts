import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AnimeItem {
  title: string;
  episode: string;
  info: string;
  releaseDate: string;
  image: string;
  slug: string;
}

interface ScrapingResponse {
  ongoing: AnimeItem[];
  complete: AnimeItem[];
}

export async function GET() {
  try {
    const { data: html } = await axios.get('https://otakudesu.cloud/');
    const $ = cheerio.load(html);

    const results: ScrapingResponse = {
      ongoing: [],
      complete: [],
    };

    $('.rseries .rapi').each((_, categoryElement) => {
      const categoryTitle = $(categoryElement).find('#rvod h1').text().trim();
      const animeItems: AnimeItem[] = [];

      $(categoryElement)
        .find('.venz ul li .detpost')
        .each((_, animeElement) => {
          const title = $(animeElement).find('.jdlflm').text().trim();
          const episode = $(animeElement).find('.epz').text().trim();
          const info = $(animeElement).find('.epztipe').text().trim();
          const releaseDate = $(animeElement).find('.newnime').text().trim();
          const image = $(animeElement).find('img').attr('src') || '';
          const link = $(animeElement).find('a').attr('href') || '';
          const slug = link.split('/').filter(Boolean).pop() || '';

          if (title && image) {
            animeItems.push({ title, episode, info, releaseDate, image, slug });
          }
        });

      if (categoryTitle === 'On-going Anime') {
        results.ongoing = animeItems;
      } else if (categoryTitle === 'Complete Anime') {
        results.complete = animeItems;
      }
    });

    return NextResponse.json(results, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error during scraping:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime data' },
      { status: 500 }
    );
  }
}
