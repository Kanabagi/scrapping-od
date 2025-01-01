'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AnimeList {
  label: string;
  data: [
    {
      title: string;
      url: string;
      slug: string;
    }
  ];
}

export default function AnimeListPage() {
  const [animes, setAnimes] = useState<AnimeList[]>([]);

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/anime');
        const data = await res.json();
        setAnimes(data.animes);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAnimes();
  }, []);

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <div className="space-y-2">
        {animes?.map((anime, index) => {
          return (
            <div key={index + anime.label} className="border p-2">
              <h3 className="text-xl font-bold">{anime.label}</h3>
              <ul className="grid grid-cols-3 gap-2">
                {anime.data.map((list, index) => {
                  return (
                    <li key={index}>
                      <Link href={`/anime/${list.slug}`}>{list.title}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
