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

export async function GET() {
  try {
    const { data: html } = await axios.get('https://otakudesu.cloud/');
    const $ = cheerio.load(html);

    const ongoing: AnimeItem[] = [];
    const complete: AnimeItem[] = [];

    $('.rseries .rapi').each((_, categoryElement) => {
      const categoryTitle = $(categoryElement).find('#rvod h1').text().trim();

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
            const animeItem: AnimeItem = {
              title,
              episode,
              info,
              releaseDate,
              image,
              slug,
            };
            if (categoryTitle === 'On-going Anime') {
              ongoing.push(animeItem);
            } else if (categoryTitle === 'Complete Anime') {
              complete.push(animeItem);
            }
          }
        });
    });

    return NextResponse.json({
      status: 200,
      message: 'success',
      data: { ongoing, complete },
    });
  } catch (error) {
    console.error('Error during scraping:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Failed to fetch anime data',
        data: [],
      },
      { status: 500 }
    );
  }
}
