import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AnimeItem {
    title: string;
    imageUrl: string;
    genres: string;
    status: string;
    rating: string;
    slug: string;
}

export async function GET(req: NextResponse, { params }: { params: { query: string } }) {
    const { query } = params;

    try {
        const { data: html } = await axios.get(`https://otakudesu.cloud/?s=${query}&post_type=anime`);
        const $ = cheerio.load(html);

        const animeItems: AnimeItem[] = [];

        // Scrape the data from the <ul class="chivsrc"> list
        $('.chivsrc li').each((_, animeElement) => {
            const imageUrl = $(animeElement).find('img').attr('src') || '';
            const title = $(animeElement).find('h2 a').text().trim();

            // Scrape all genres and join them into a single string
            const genres = $(animeElement).find('.set a')
                .map((_, el) => $(el).text())
                .get()
                .join(', ');

            const status = $(animeElement).find('.set').eq(1).text().replace('Status :', '').trim();
            const rating = $(animeElement).find('.set').eq(2).text().replace('Rating :', '').trim();
            const link = $(animeElement).find('a').attr('href') || '';
            const slug = link.split('/').filter(Boolean).pop() || '';

            if (title && imageUrl && genres && status && rating) {
                animeItems.push({
                    title,
                    imageUrl,
                    genres,
                    status,
                    rating,
                    slug
                });
            }
        });

        return NextResponse.json({
            status: 200,
            message: 'success',
            data: animeItems,
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
