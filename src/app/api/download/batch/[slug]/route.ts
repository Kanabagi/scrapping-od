import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface Source {
  name: string;
  url: string;
}

interface Data {
  quality: string;
  size: string;
  source: Source[];
}

interface Download {
  title: string;
  data: Data[];
}

export async function GET(
  req: NextResponse,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const url = `https://otakudesu.cloud/batch/${slug}/`;

  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    const downloadUrl: Download[] = [];

    $('h4').each((_, h4Element) => {
      const title = $(h4Element).text().trim();
      const ulElement = $(h4Element).next('ul');

      const data: Data[] = [];

      ulElement.find('li').each((__, liElement) => {
        const quality = $(liElement).find('strong').text().trim();
        const size = $(liElement).find('i').text().trim();
        const source: Source[] = [];

        $(liElement)
          .find('a')
          .each((___, link) => {
            const name = $(link).text().trim();
            const url = $(link).attr('href') || '';

            if (name && url) {
              source.push({ name, url });
            }
          });

        if (quality && source.length > 0) {
          data.push({
            quality,
            size,
            source,
          });
        }
      });

      downloadUrl.push({
        title,
        data,
      });
    });

    return NextResponse.json({
      status: 200,
      message: 'success',
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
