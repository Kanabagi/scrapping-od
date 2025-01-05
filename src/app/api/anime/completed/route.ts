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

export async function GET(req: Request) {
    const baseUrl = 'https://otakudesu.cloud/complete-anime/';
    const urlParams = new URL(req.url).searchParams;

    // Get the requested page and set default to 1
    const page = parseInt(urlParams.get('page') || '1', 10);

    // Limit the number of items to scrape
    const limit = 24;

    try {
        // Build the URL for the specific page
        const url = page === 1 ? baseUrl : `${baseUrl}page/${page}/`;
        console.log(`Scraping page: ${page}`);

        // Fetch and load HTML for the specific page
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);

        // Extract anime data with a limit
        const animeList: AnimeItem[] = [];
        let count = 0; // To track the number of items scraped
        $('.rseries .rapi').each((_, categoryElement) => {
            $(categoryElement)
                .find('.venz ul li .detpost')
                .each((_, animeElement) => {
                    if (count >= limit) return false; // Stop when the limit is reached

                    const title = $(animeElement).find('.jdlflm').text().trim();
                    const episode = $(animeElement).find('.epz').text().trim();
                    const info = $(animeElement).find('.epztipe').text().trim();
                    const releaseDate = $(animeElement).find('.newnime').text().trim();
                    const image = $(animeElement).find('img').attr('src') || '';
                    const link = $(animeElement).find('a').attr('href') || '';
                    const slug = link.split('/').filter(Boolean).pop() || '';

                    if (title && image) {
                        animeList.push({
                            title,
                            episode,
                            info,
                            releaseDate,
                            image,
                            slug,
                        });
                        count++; // Increment the count
                    }
                });
        });

        // Determine if there is a next page
        const hasNextPage = !!$('.pagination .next.page-numbers').attr('href');

        return NextResponse.json({
            status: 200,
            message: 'success',
            page,
            hasNextPage,
            data: animeList,
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
