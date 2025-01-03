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
  title: string;
  qualities: { [quality: string]: Quality[] };
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

    // Extract title from the page
    const streamingTitle = $('h1.posttl').text().trim();

    // Extract streaming URL
    let streamingUrl =
      $('#oframeplayerjs video').attr('src') ||
      $('.pjscssed video').attr('src') ||
      $('#playerjs video').attr('src') ||
      $('video').attr('src');

    if (!streamingUrl) {
      streamingUrl =
        $('#pjsfrrsplayerjs').attr('src') || $('iframe').attr('src');
    }

    if (!streamingUrl) {
      const scripts = $('script').toArray();
      for (const script of scripts) {
        const content = $(script).html() || '';
        const urlMatch =
          content.match(/source:\s*['"]([^'"]+)['"]/i) ||
          content.match(/src:\s*['"]([^'"]+)['"]/i);
        if (urlMatch && urlMatch[1]) {
          streamingUrl = urlMatch[1];
          break;
        }
      }
    }

    // Scrape download URLs
    const downloadUrl: Download[] = [];
    $('h4').each((_, h4Element) => {
      const title = $(h4Element).text().trim();
      const ulElements = $(h4Element).nextUntil('h4', 'ul');
      const qualities: { [quality: string]: Quality[] } = {};

      ulElements.each((__, ulElement) => {
        $(ulElement)
          .find('li')
          .each((___, liElement) => {
            const qualityText = $(liElement).find('strong').text().trim();
            const sizeText = $(liElement).find('i').text().trim();
            const sources: Source[] = [];

            $(liElement)
              .find('a')
              .each((____, link) => {
                const name = $(link).text().trim();
                const url = $(link).attr('href') || '';

                if (name && url) {
                  sources.push({ name, url });
                }
              });

            if (qualityText && sources.length > 0) {
              if (!qualities[qualityText]) {
                qualities[qualityText] = [];
              }
              qualities[qualityText].push({
                size: sizeText,
                sources,
              });
            }
          });
      });

      downloadUrl.push({
        title,
        qualities,
      });
    });

    // Scrape other episodes
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
      data: [
        {
          streaming: {
            streamingTitle,
            streamingUrl,
          },
          downloadUrl,
          otherEps,
        },
      ],
    });
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch data',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
