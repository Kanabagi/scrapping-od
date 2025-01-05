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

    try {
        // Build the URL for the specific page
        const url = page === 1 ? baseUrl : `${baseUrl}page/${page}/`;
        console.log(`Scraping page: ${page}`);

        // Fetch and load HTML for the specific page
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);

        // Extract anime data with a limit of 24 items
        const animeList: AnimeItem[] = [];
        $('.rseries .rapi').each((_, categoryElement) => {
            $(categoryElement)
                .find('.venz ul li .detpost')
                .each((index, animeElement) => {
                    if (animeList.length >= 24) return false; // Limit to 24 items
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
                    }
                });
        });

        // Determine if there is a next page and calculate total pages
        const totalPages = $('.pagination .page-numbers:not(.next):not(.prev)')
            .last()
            .text()
            .trim();

        const hasNextPage = !!$('.pagination .next.page-numbers').attr('href');

        return NextResponse.json({
            status: 200,
            message: 'success',
            page,
            hasNextPage,
            totalPages: parseInt(totalPages, 10) || 1, // Fallback to 1 if totalPages isn't found
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
