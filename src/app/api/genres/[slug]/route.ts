import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AnimeItem {
    title: string;
    episodes: string;
    info: string;
    genres: string[];
    image: string;
    releaseDate: string;
    slug: string;
}

export async function GET(
    req: Request,
    { params }: { params: { slug: string } }
) {
    const { slug } = params;
    const urlParams = new URL(req.url).searchParams;

    const page = parseInt(urlParams.get('page') || '1', 10);
    const limit = parseInt(urlParams.get('limit') || '12', 10);

    if (!slug) {
        return NextResponse.json(
            {
                status: 400,
                message: 'Genre slug is required',
                data: [],
            },
            { status: 400 }
        );
    }

    try {
        const baseUrl = 'https://otakudesu.cloud/genres/';
        const url =
            page === 1
                ? `${baseUrl}${slug}/`
                : `${baseUrl}${slug}/page/${page}/`;

        console.log(`Scraping slug: ${slug}, page: ${page}`);

        const { data: html } = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });
        const $ = cheerio.load(html);

        const animeList: AnimeItem[] = [];
        $('.col-anime-con').each((_, element) => {
            const title = $(element).find('.col-anime-title a').text().trim();
            const detailUrl = $(element).find('.col-anime-title a').attr('href') || '';
            const slug = detailUrl.split('/').filter(Boolean).pop() || '';

            if (title) {
                animeList.push({
                    title,
                    episodes: $(element).find('.col-anime-eps').text().trim(),
                    info: $(element).find('.col-anime-rating').text().trim(),
                    genres: $(element)
                        .find('.col-anime-genre a')
                        .map((_, el) => $(el).text().trim())
                        .get(),
                    image: $(element).find('.col-anime-cover img').attr('src') || '',
                    releaseDate: $(element).find('.col-anime-date').text().trim(),
                    slug,
                });
            }
        });

        // Use consistent totalPages calculation
        let totalPages = parseInt($('.pagination .page-numbers:not(.next):not(.prev)').last().text().trim(), 10);
        if (isNaN(totalPages)) {
            // Fallback: If pagination is missing, assume a single page
            totalPages = page;
        }

        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        const paginatedData = animeList.slice(0, limit);

        return NextResponse.json({
            status: 200,
            message: 'success',
            page,
            totalPages,
            hasNextPage,
            data: paginatedData,
        });
    } catch (error) {
        console.error('Error during scraping:', error);

        const status = axios.isAxiosError(error) && error.response?.status === 404 ? 404 : 500;
        const message =
            status === 404 ? 'Genre not found' : 'Failed to fetch anime list';

        return NextResponse.json(
            {
                status,
                message,
                page,
                totalPages: 1,
                hasNextPage: false,
                data: [],
            },
            { status }
        );
    }
}
