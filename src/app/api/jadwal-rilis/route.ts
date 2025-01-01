import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';

interface Anime {
  title: string;
  slug: string;
}

interface Schedule {
  day: string;
  list: Anime[];
}

export async function GET() {
  try {
    const url = 'https://otakudesu.cloud/jadwal-rilis/';

    // Fetch HTML menggunakan Axios
    const { data: html } = await axios.get(url);

    const $ = cheerio.load(html);
    const schedule: Schedule[] = [];

    // Scraping jadwal rilis
    $('.kglist321').each((_, element) => {
      const day = $(element).find('h2').text().trim();
      const list: Anime[] = [];

      $(element)
        .find('ul li a')
        .each((_, animeElement) => {
          const title = $(animeElement).text().trim();
          const url = $(animeElement).attr('href') || '';
          const slug = url.split('/').filter(Boolean).pop() || '';

          list.push({
            title,
            slug,
          });
        });

      if (day) {
        schedule.push({ day, list });
      }
    });

    // Format output
    return NextResponse.json({
      status: 200,
      message: 'success',
      data: schedule,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message: 'Something went wrong',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
