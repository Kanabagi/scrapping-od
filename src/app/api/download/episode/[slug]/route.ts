import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface Source {
  name: string;
  url: string;
}

interface DownloadData {
  quality: string;
  size: string;
  source: Source[];
}

interface DownloadUrl {
  title: string;
  data: DownloadData[];
}

interface OtherEpisode {
  title: string;
  slug: string;
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

    // Extract streaming data
    const streamingTitle = $('h1.posttl').text().trim();
    let streamingUrl =
      $('#oframeplayerjs video').attr('src') ||
      $('.pjscssed video').attr('src') ||
      $('#playerjs video').attr('src') ||
      $('video').attr('src');

    if (!streamingUrl) {
      streamingUrl =
        $('#pjsfrrsplayerjs').attr('src') || $('iframe').attr('src');
    }

    // Extract download data
    const downloadUrl: DownloadUrl[] = [];
    $('h4').each((_, h4Element) => {
      const title = $(h4Element).text().trim();
      const data: DownloadData[] = [];

      $(h4Element)
        .next('ul')
        .find('li')
        .each((__, liElement) => {
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

      if (title && data.length > 0) {
        downloadUrl.push({ title, data });
      }
    });

    // Extract other episodes
    const otherEps: OtherEpisode[] = [];
    $('#selectcog option').each((_, optionElement) => {
      const title = $(optionElement).text().trim();
      const episodeUrl = $(optionElement).attr('value');
      if (episodeUrl && title !== 'Pilih Episode Lainnya') {
        const slug = episodeUrl.split('/').slice(-2, -1)[0];
        otherEps.push({
          title,
          slug,
        });
      }
    });

    return NextResponse.json({
      status: 200,
      message: 'success',
      data: {
        streaming: {
          streamingTitle,
          streamingUrl,
        },
        downloadUrl,
        otherEps,
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Failed to fetch data',
        error:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
