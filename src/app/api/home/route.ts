// app/api/home/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Define types for our response
export interface AnimeItem {
    title: string;
    episode: string;
    info: string;
    releaseDate: string;
    image: string;
    detailUrl?: string;
    slug: string; // Added slug property
}

interface ScrapingResponse {
    ongoing: AnimeItem[];
    complete: AnimeItem[];
}

export async function GET() {
    try {
        // Fetch HTML content
        const response = await axios.get('https://otakudesu.cloud/');
        const html = response.data;
        const $ = cheerio.load(html);

        const results: ScrapingResponse = {
            ongoing: [],
            complete: [],
        };

        // Process each anime section
        $('.rseries .rapi').each((_, section) => {
            const categoryTitle = $(section).find('#rvod h1').text().trim();
            const animeList: AnimeItem[] = [];

            $(section)
                .find('.venz ul li .detpost')
                .each((_, anime) => {
                    const title = $(anime).find('.jdlflm').text().trim();
                    const episode = $(anime)
                        .find('.epz')
                        .text()
                        .replace(/\s+/g, ' ')
                        .trim();
                    const info = $(anime)
                        .find('.epztipe')
                        .text()
                        .replace(/\s+/g, ' ')
                        .trim();
                    const releaseDate = $(anime).find('.newnime').text().trim();
                    const image = $(anime).find('img').attr('src') || '';
                    const detailUrlOtaku = $(anime).find('a').attr('href') || '';

                    // Extract slug from detailUrl
                    const slug = detailUrlOtaku.split('/').filter(Boolean).pop() || '';

                    const detailUrl = `http://localhost:3000/api/anime/${slug}`

                    if (title && detailUrl) {
                        animeList.push({
                            title,
                            episode,
                            info,
                            releaseDate,
                            image,
                            slug, // Add slug to AnimeItem
                        });
                    }
                });

            // Add to appropriate category in results
            if (categoryTitle === 'On-going Anime') {
                results.ongoing = animeList;
            } else if (categoryTitle === 'Complete Anime') {
                results.complete = animeList;
            }
        });

        // Return the response
        return NextResponse.json(results, {
            status: 200,
            headers: {
                'Cache-Control': 'public, max-age=300',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch anime data' },
            { status: 500 }
        );
    }
}
