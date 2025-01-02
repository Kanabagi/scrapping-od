'use client';

import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface Anime {
  title: string;
  episodes: string;
  genres: [];
  coverImage: string;
  releaseDate: string;
  slug: string;
}

export default function AnimeByGenre({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_visible_page: 1,
    has_next_page: false,
    next_page: null,
    has_previous_page: false,
    previous_page: null,
  });

  const fetchData = async (page: number) => {
    try {
      const res = await axios.get(`/api/genres/${slug}?page=${page}`);
      const data = await res.data;
      setAnimes(data.data);
      setPagination({
        current_page: data.current_page,
        last_visible_page: data.last_visible_page,
        has_next_page: data.has_next_page,
        next_page: data.next_page,
        has_previous_page: data.has_previous_page,
        previous_page: data.previous_page,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handleNextPage = () => {
    if (pagination.has_next_page && pagination.next_page) {
      setCurrentPage(pagination.next_page);
    }
  };

  const handlePrevPage = () => {
    if (pagination.has_previous_page && pagination.previous_page) {
      setCurrentPage(pagination.previous_page);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-y-4">
      <h2 className="text-2xl font-bold capitalize">{slug} Anime</h2>
      <div className="flex items-center justify-center gap-x-4 mb-4">
        <button
          onClick={handlePrevPage}
          disabled={!pagination.has_previous_page}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {pagination.current_page} of {pagination.last_visible_page}
        </span>
        <button
          onClick={handleNextPage}
          disabled={!pagination.has_next_page}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <ul className="grid grid-cols-7 gap-2">
        {animes &&
          animes.map((anime, index) => (
            <li key={index}>
              <Image
                src={anime.coverImage}
                alt={anime.title}
                height={500}
                width={500}
                className="h-[250px] w-full object-cover rounded-md"
              />
              <Link href={`/anime/${anime.slug}`}>
                <h3>
                  {anime.title.length > 20
                    ? anime.title.slice(0, 20) + '...'
                    : anime.title}
                </h3>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
