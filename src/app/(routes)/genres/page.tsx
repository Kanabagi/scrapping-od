'use client';

import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Genre {
  label: string;
  slug: string;
}

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/genres');
        const data = await res.data;
        setGenres(data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  });
  return (
    <div className="p-4 flex flex-col gap-y-4">
      <h2 className="text-2xl font-bold">Daftar Genre</h2>
      <ul className="grid grid-cols-12 gap-2">
        {genres &&
          genres.map((genre, index) => {
            return (
              <Link
                key={index}
                href={`/genres/${genre.slug}`}
                className="border p-1"
              >
                <li>{genre.label}</li>
              </Link>
            );
          })}
      </ul>
    </div>
  );
}
