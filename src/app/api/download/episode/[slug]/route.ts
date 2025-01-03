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
    qualities: { [quality: string]: Quality[] };
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

        $('h4').each((_, h4Element) => {
            const title = $(h4Element).text().trim();

            const ulElements = $(h4Element).nextUntil('h4', 'ul');
            const qualities: { [quality: string]: Quality[] } = {};

            ulElements.each((__, ulElement) => {
                $(ulElement)
                    .find('li')
                    .each((___, liElement) => {
                        const qualityText = $(liElement).find('strong').text().trim();
                        const sizeText = $(liElement).find('i').text().trim();
                        const sources: Source[] = [];

                        $(liElement)
                            .find('a')
                            .each((____, link) => {
                                const name = $(link).text().trim();
                                const url = $(link).attr('href') || '';

                                if (name && url) {
                                    sources.push({ name, url });
                                }
                            });

                        if (qualityText && sources.length > 0) {
                            if (!qualities[qualityText]) {
                                qualities[qualityText] = [];
                            }
                            qualities[qualityText].push({
                                size: sizeText,
                                sources,
                            });
                        }
                    });
            });

            downloadUrl.push({
                title,
                qualities,
            });
        });

        return NextResponse.json({
            status: 200,
            message: 'success',
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
