import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface AnimeItem {
  title: string;
  episodes: string;
  rating: string;
  genres: string[];
  coverImage: string;
  releaseDate: string;
  slug: string;
}

interface PaginationResponse {
  status: number;
  message: string;
  current_page: number;
  last_visible_page: number;
  has_next_page: boolean;
  next_page: number | null;
  has_previous_page: boolean;
  previous_page: number | null;
  data: AnimeItem[];
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
): Promise<NextResponse<PaginationResponse>> {
  const { slug } = params;

  const { searchParams } = new URL(request.url);
  const requestedPage = searchParams.get('page');
  const currentPage = Math.max(1, parseInt(requestedPage || '1', 10));
  const limit = 15;

  try {
    if (!slug) {
      throw new Error('Genre slug is required');
    }

    const baseUrl = 'https://otakudesu.cloud/genres';
    const url =
      currentPage === 1
        ? `${baseUrl}/${slug}/`
        : `${baseUrl}/${slug}/page/${currentPage}/`;

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const animes: AnimeItem[] = [];

    // Extract anime data
    $('.col-anime-con').each((_, element) => {
      try {
        const title = $(element).find('.col-anime-title a').text().trim();
        if (!title) return;

        const detailUrl =
          $(element).find('.col-anime-title a').attr('href') || '';
        const slug = detailUrl.split('/').filter(Boolean).pop() || '';

        animes.push({
          title,
          episodes: $(element).find('.col-anime-eps').text().trim(),
          rating: $(element).find('.col-anime-rating').text().trim(),
          genres: $(element)
            .find('.col-anime-genre a')
            .map((_, el) => $(el).text().trim())
            .get(),
          coverImage: $(element).find('.col-anime-cover img').attr('src') || '',
          releaseDate: $(element).find('.col-anime-date').text().trim(),
          slug,
        });
      } catch (err) {
        console.error('Error parsing anime item:', err);
      }
    });

    // Improved pagination detection
    let lastVisiblePage = currentPage;
    const paginationNumbers: number[] = [];

    // Extract all page numbers from pagination
    $('.pagination a').each((_, element) => {
      const pageText = $(element).text().trim();
      const pageNum = parseInt(pageText, 10);
      if (!isNaN(pageNum)) {
        paginationNumbers.push(pageNum);
      }
    });

    // Get the highest page number
    if (paginationNumbers.length > 0) {
      lastVisiblePage = Math.max(...paginationNumbers);
    }

    // Check if there's a next page
    const hasNextPage = currentPage < lastVisiblePage;
    const hasPreviousPage = currentPage > 1;

    // Apply limit and return response
    const paginatedData = animes.slice(0, limit);

    return NextResponse.json({
      status: 200,
      message: 'success',
      current_page: currentPage,
      last_visible_page: lastVisiblePage,
      has_next_page: hasNextPage,
      next_page: hasNextPage ? currentPage + 1 : null,
      has_previous_page: hasPreviousPage,
      previous_page: hasPreviousPage ? currentPage - 1 : null,
      data: paginatedData,
    });
  } catch (error) {
    console.error('Failed to fetch anime list:', error);

    const isAxiosError = axios.isAxiosError(error);
    const status = isAxiosError ? error.response?.status || 500 : 500;
    const message = isAxiosError
      ? status === 404
        ? 'Genre not found'
        : 'Failed to fetch anime list'
      : 'Internal server error';

    return NextResponse.json(
      {
        status,
        message,
        current_page: currentPage,
        last_visible_page: currentPage,
        has_next_page: false,
        next_page: null,
        has_previous_page: currentPage > 1,
        previous_page: currentPage > 1 ? currentPage - 1 : null,
        data: [],
      },
      { status }
    );
  }
}
