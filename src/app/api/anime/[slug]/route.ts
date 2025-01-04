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
    const synopsis = $('.sinopc').text().trim();
    const details: Record<string, string | string[]> = {};

    // Extract details
    $('.infozingle p').each((_, el) => {
      const key = $(el)
        .find('b')
        .text()
        .trim()
        .replace(':', '')
        .toLowerCase()
        .replace(/\s+/g, '');
      let value: string | string[] = $(el).text().replace(`${key}:`, '').trim();

      if (key === 'genre' || key === 'produser') {
        value = value.split(',').map((item) => item.trim());
      } else {
        value = value.replace(/^[^:]*:\s*/, '');
      }

      details[key] = value;
    });

    // Separate episodes into batch, single, and lengkap
    const singleEpisodes: { title: string; slug: string; date: string }[] = [];
    const lengkapEpisodes: { title: string; slug: string; date: string }[] = [];
    let batchSlug = '';

    $('.episodelist ul li').each((_, el) => {
      const title = $(el).find('a').text().trim();
      const fullUrl = $(el).find('a').attr('href') || '';
      const slug = fullUrl.split('/').filter(Boolean).pop() || '';
      const date = $(el).find('.zeebr').text().trim();

      if (fullUrl.toLowerCase().includes('batch')) {
        batchSlug = slug;
      } else if (fullUrl.toLowerCase().includes('lengkap')) {
        lengkapEpisodes.push({ title, slug, date });
      } else {
        singleEpisodes.push({ title, slug, date });
      }
    });

    // Fetch batch details
    let batch = null;
    if (batchSlug) {
      const batchUrl = `https://otakudesu.cloud/batch/${batchSlug}/`;
      const batchResponse = await axios.get(batchUrl);
      const batchHtml = batchResponse.data;
      const batch$ = cheerio.load(batchHtml);
      const batchData: {
        title: string;
        data: {
          quality: string;
          size: string;
          source: { name: string; url: string }[];
        }[];
      }[] = [];

      batch$('h4').each((_, h4Element) => {
        const batchTitle = batch$(h4Element).text().trim();
        const ulElement = batch$(h4Element).next('ul');
        const data: {
          quality: string;
          size: string;
          source: { name: string; url: string }[];
        }[] = [];

        ulElement.find('li').each((__, liElement) => {
          const quality = batch$(liElement).find('strong').text().trim();
          const size = batch$(liElement).find('i').text().trim();
          const source: { name: string; url: string }[] = [];

          batch$(liElement)
            .find('a')
            .each((___, link) => {
              const name = batch$(link).text().trim();
              const url = batch$(link).attr('href') || '';
              if (name && url) {
                source.push({ name, url });
              }
            });

          if (quality) {
            data.push({ quality, size, source });
          }
        });

        batchData.push({ title: batchTitle, data });
      });

      batch = batchData;
    }

    return NextResponse.json({
      status: 200,
      message: 'success',
      data: {
        title,
        synopsis,
        imageUrl,
        details,
        batch,
        single: singleEpisodes,
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
