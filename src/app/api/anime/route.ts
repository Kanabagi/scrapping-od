import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    // Navigate to the page
    await page.goto('https://otakudesu.cloud/anime-list/', {
      waitUntil: 'domcontentloaded',
    });

    // Extract HTML
    const html = await page.content();
    await browser.close();

    // Process HTML with Cheerio
    const $ = cheerio.load(html);
    const groupedAnimeList: { [key: string]: { title: string; slug: string }[] } = {};

    $('.daftarkartun .penzbar .jdlbar ul li a').each((_, element) => {
      const title = $(element).text().trim();
      const url = $(element).attr('href') || '';

      if (title && url) {
        const firstLetter = /^[A-Z]/i.test(title[0])
          ? title[0].toUpperCase()
          : '#';
        const slugMatch = url.match(/\/([^/]+)\/?$/);
        const slug = slugMatch ? slugMatch[1] : '';
        if (!groupedAnimeList[firstLetter]) {
          groupedAnimeList[firstLetter] = [];
        }
        groupedAnimeList[firstLetter].push({ title, slug });
      }
    });

    const data = Object.keys(groupedAnimeList)
      .sort()
      .map((key) => ({
        label: key,
        data: groupedAnimeList[key],
      }));

    return NextResponse.json({
      status: 200,
      message: 'success',
      data,
    });
  } catch (error) {
    console.error('Error scraping Anime List:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime list' },
      { status: 500 }
    );
  }
}



// import { NextResponse } from 'next/server';
// import axios from 'axios';
// import * as cheerio from 'cheerio';

// export async function GET() {
//     try {
//         // Fetch HTML from the Anime List page
//         const { data: html } = await axios.get(
//             'https://otakudesu.cloud/anime-list/'
//         );

//         const $ = cheerio.load(html);

//         // Temporary object to group anime titles by their starting letter
//         const groupedAnimeList: Record<
//             string,
//             { title: string; url?: string; slug: string }[]
//         > = {};

//         // Select all anime links from the anime list section
//         $('.daftarkartun .penzbar .jdlbar ul li a').each((_, element) => {
//             const title = $(element).text().trim();
//             const url = $(element).attr('href') || '';

//             if (title && url) {
//                 const firstLetter = /^[A-Z]/i.test(title[0])
//                     ? title[0].toUpperCase()
//                     : '#';

//                 // Extract slug from URL
//                 const slugMatch = url.match(/\/([^/]+)\/?$/);
//                 const slug = slugMatch ? slugMatch[1] : '';

//                 // Ensure key exists for the first letter
//                 if (!groupedAnimeList[firstLetter]) {
//                     groupedAnimeList[firstLetter] = [];
//                 }

//                 // Add the anime to the corresponding group
//                 groupedAnimeList[firstLetter].push({ title, slug });
//             }
//         });

//         const data = Object.keys(groupedAnimeList)
//             .sort() // Ensure alphabetical order
//             .map((key) => ({
//                 label: key,
//                 data: groupedAnimeList[key],
//             }));

//         return NextResponse.json({
//             status: 200,
//             message: 'success',
//             data,
//         });
//     } catch (error) {
//         console.error('Error scraping Anime List:', error);
//         if (axios.isAxiosError(error)) {
//             console.error('Error details:', error.response?.status, error.response?.data, error.message);
//         } else {
//             console.error('Error details:', error);
//         }
//         return NextResponse.json(
//             { error: 'Failed to fetch anime list' },
//             { status: 500 }
//         );
//     }
// }
