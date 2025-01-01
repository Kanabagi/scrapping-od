import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface Source {
  name: string;
  url: string;
}

interface Quality {
  size: string;
  sources: Source[];
}

interface Download {
  [quality: string]: Quality;
}

export async function GET(
  req: NextResponse,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const url = `https://otakudesu.cloud/episode/${slug}/`;

  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    const downloadUrl: Download[] = [];

    $('ul > li').each((_, element) => {
      const qualityText = $(element).find('strong').text().trim();
      const sizeText = $(element).find('i').text().trim();
      const sources: Source[] = [];

      $(element)
        .find('a')
        .each((__, link) => {
          const name = $(link).text().trim();
          const url = $(link).attr('href');

          if (name && url) {
            sources.push({ name, url });
          }
        });

      if (qualityText && sources.length > 0) {
        downloadUrl.push({
          [qualityText]: {
            size: sizeText,
            sources,
          },
        });
      }
    });

    return NextResponse.json({
      downloadUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
