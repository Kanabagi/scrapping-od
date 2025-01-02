import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const url = 'https://otakudesu.cloud/genre-list/';
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    const genres: { label: string; slug: string }[] = [];

    $('ul.genres a').each((_, element) => {
      const label = $(element).text().trim();
      const href = $(element).attr('href');
      const slug = href ? href.split('/').filter(Boolean).pop() || '' : '';
      genres.push({ label, slug });
    });

    return NextResponse.json({
      status: '200',
      message: 'success',
      data: genres,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch genres',
        data: [],
      },
      { status: 500 }
    );
  }
}
