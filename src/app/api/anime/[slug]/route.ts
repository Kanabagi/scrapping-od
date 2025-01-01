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
        const details: Record<string, string> = {};

        // Extract details
        $('.infozingle p').each((_, el) => {
            const key = $(el)
                .find('b')
                .text()
                .trim()
                .replace(':', '')
                .toLowerCase()
                .replace(/\s+/g, '');
            const value = $(el).text().replace(`${key}:`, '').trim();
            details[key] = value;
        });

        const episodeElements = $('.episodelist ul li').toArray();


        const fetchTasks = episodeElements.map(async (el) => {
            const title = $(el).find('a').text().trim();
            const url = $(el).find('a').attr('href') || '';
            const date = $(el).find('.zeebr').text().trim();
            const newSlug = url.split('/').filter(Boolean).pop() || '';

            if (!title || (title.toLowerCase().includes('end') && title.toLowerCase().includes('sub indo'))) {

                return null;
            }

            let downloadUrl: any[] = [];
            try {
                if (title.toLowerCase().includes('batch')) {

                    const batchResponse = await axios.get(`http://localhost:3000/api/download/batch/${newSlug}`);
                    downloadUrl = batchResponse.data.downloadUrl;
                } else {

                    const epsResponse = await axios.get(`http://localhost:3000/api/download/episode/${newSlug}`);
                    downloadUrl = epsResponse.data.downloadUrl || [];
                }
            } catch (error) {
                console.log(`Failed to fetch download URL for ${newSlug}:`);
            }

            return {
                title,
                url,
                date,
                newSlug,
                downloadUrl,
                type: title.toLowerCase().includes('batch') ? 'batch' : 'single',
            };
        });

        const episodes = await Promise.all(fetchTasks);

        // Categorize episodes
        const batchEpisodes = episodes.filter((ep) => ep?.type === 'batch');
        const singleEpisodes = episodes.filter((ep) => ep?.type === 'single');

        return NextResponse.json({
            title,
            imageUrl,
            details,
            batch: batchEpisodes,
            single: singleEpisodes,
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}

// NU IEU TEREH PISAN COOO NGAN DATA DOWNLAODNA KATUKER ANTARA SINGLE JEUNG LENGKAP TEUING KUMAHA NGOMEKEUNA :v

// import { NextResponse } from 'next/server';
// import axios from 'axios';
// import * as cheerio from 'cheerio';

// export async function GET(
//     req: Request,
//     { params }: { params: { slug: string } }
// ) {
//     const { slug } = params;
//     const url = `https://otakudesu.cloud/anime/${slug}/`;

//     try {
//         const response = await axios.get(url);
//         const html = response.data;
//         const $ = cheerio.load(html);

//         const title = $('.jdlrx h1').text().trim();
//         const imageUrl = $('.fotoanime img').attr('src') || '';
//         const details: Record<string, string> = {};

//         // Extract details
//         $('.infozingle p').each((_, el) => {
//             const key = $(el)
//                 .find('b')
//                 .text()
//                 .trim()
//                 .replace(':', '')
//                 .toLowerCase()
//                 .replace(/\s+/g, '');
//             const value = $(el).text().replace(`${key}:`, '').trim();
//             details[key] = value;
//         });

//         const episodeElements = $('.episodelist ul li').toArray();

//         // Prepare fetch tasks for batch and single episodes
//         const fetchTasks = episodeElements.map(async (el) => {
//             const title = $(el).find('a').text().trim();
//             const url = $(el).find('a').attr('href') || '';
//             const date = $(el).find('.zeebr').text().trim();
//             const newSlug = url.split('/').filter(Boolean).pop() || '';

//             if (!title) return null;

//             let downloadUrl: any[] = [];
//             try {
//                 if (title.toLowerCase().includes('batch') || title.toLowerCase().includes('sub indo')) {
//                     // Fetch download URLs
//                     const [batchResponse, epsResponse] = await Promise.all([
//                         title.toLowerCase().includes('batch')
//                             ? axios.get(`http://localhost:3000/api/download/batch/${newSlug}`)
//                             : null,
//                         axios.get(`http://localhost:3000/api/download/episode/${newSlug}`),
//                     ]);

//                     downloadUrl = batchResponse
//                         ? batchResponse.data.downloadUrl
//                         : epsResponse?.data.downloadUrl || [];
//                 }
//             } catch (error) {
//                 console.log(`Failed to fetch download URL for ${newSlug}:`);
//             }

//             return {
//                 title,
//                 url,
//                 date,
//                 newSlug,
//                 downloadUrl,
//                 type: title.toLowerCase().includes('batch')
//                     ? 'batch'
//                     : title.toLowerCase().includes('sub indo') && title.toLowerCase().includes('end')
//                     ? 'lengkap'
//                     : 'single',
//             };
//         });

//         const episodes = await Promise.all(fetchTasks);

//         // Categorize episodes
//         const batchEpisodes = episodes.filter((ep) => ep?.type === 'batch');
//         const singleEpisodes = episodes.filter((ep) => ep?.type === 'single');
//         // const lengkapEpisodes = episodes.filter((ep) => ep?.type === 'lengkap');

//         return NextResponse.json({
//             title,
//             imageUrl,
//             details,
//             batch: batchEpisodes,
//             single: singleEpisodes,
//             // lengkap: lengkapEpisodes,
//         });
//     } catch (error) {
//         console.log(error);
//         return NextResponse.json(
//             { error: 'Failed to fetch data' },
//             { status: 500 }
//         );
//     }
// }
