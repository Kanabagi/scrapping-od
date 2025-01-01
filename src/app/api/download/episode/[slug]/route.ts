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
    qualities: { [quality: string]: Quality };
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
        const downloadUrl: Download[] = [];

        // Loop through each <h4> and process its associated <ul>
        $('h4').each((_, h4Element) => {
            const title = $(h4Element).text().trim();

            // Process the <ul> that follows this <h4>
            const ulElement = $(h4Element).next('ul');
            const qualities: { [quality: string]: Quality } = {};

            ulElement.find('li').each((__, liElement) => {
                const qualityText = $(liElement).find('strong').text().trim();
                const sizeText = $(liElement).find('i').text().trim();
                const sources: Source[] = [];

                $(liElement)
                    .find('a')
                    .each((___, link) => {
                        const name = $(link).text().trim();
                        const url = $(link).attr('href') || '';

                        if (name && url) {
                            sources.push({ name, url });
                        }
                    });

                if (qualityText && sources.length > 0) {
                    qualities[qualityText] = {
                        size: sizeText,
                        sources,
                    };
                }
            });

            // Add this download entry to the result
            downloadUrl.push({
                title,
                qualities,
            });
        });

        return NextResponse.json({
            downloadUrl,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}
