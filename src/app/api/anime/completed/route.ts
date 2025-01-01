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


    const page = parseInt(urlParams.get('page') || '1', 10);

    try {

        const url = page === 1 ? baseUrl : `${baseUrl}page/${page}/`;
        console.log(`Scraping page: ${page}`);


        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);


        const animeList: AnimeItem[] = [];
        $('.rseries .rapi').each((_, categoryElement) => {
            $(categoryElement)
                .find('.venz ul li .detpost')
                .each((_, animeElement) => {
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



// VERSI NDAK PAKE PAGINATION BERAT JUGA ANYING aAWOAWKAKWOAKWAOKOWA

// export async function GET() {
//     const baseUrl = 'https://otakudesu.cloud/complete-anime/';
//     let currentPage = 1;
//     const ongoing: AnimeItem[] = [];

//     try {
//         while (true) {
//             const url = currentPage === 1 ? baseUrl : `${baseUrl}page/${currentPage}/`;
//             console.log(`Scraping page: ${currentPage}`);
//             const { data: html } = await axios.get(url);
//             const $ = cheerio.load(html);

//             $('.rseries .rapi').each((_, categoryElement) => {
//                 $(categoryElement)
//                     .find('.venz ul li .detpost')
//                     .each((_, animeElement) => {
//                         const title = $(animeElement).find('.jdlflm').text().trim();
//                         const episode = $(animeElement).find('.epz').text().trim();
//                         const info = $(animeElement).find('.epztipe').text().trim();
//                         const releaseDate = $(animeElement).find('.newnime').text().trim();
//                         const image = $(animeElement).find('img').attr('src') || '';
//                         const link = $(animeElement).find('a').attr('href') || '';
//                         const slug = link.split('/').filter(Boolean).pop() || '';

//                         if (title && image) {
//                             ongoing.push({
//                                 title,
//                                 episode,
//                                 info,
//                                 releaseDate,
//                                 image,
//                                 slug,
//                             });
//                         }
//                     });
//             });

//             const nextButton = $('.pagination .next.page-numbers').attr('href');
//             if (!nextButton) break;

//             currentPage++;
//         }

//         return NextResponse.json({
//             status: 200,
//             message: 'success',
//             data: ongoing
//         });
//     } catch (error) {
//         console.error('Error during scraping:', error);
//         return NextResponse.json(
//             {
//                 status: 500,
//                 message: 'Failed to fetch anime data',
//                 data: [],
//             },
//             { status: 500 }
//         );
//     }
// }
