'use client';

import { useEffect, useState } from 'react';
import { AnimeItem } from './api/home/route';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const [ongoAnimes, setOngoAnimes] = useState<AnimeItem[]>([]);
  const [complAnimes, setComplAnimes] = useState<AnimeItem[]>([]);

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/home');
        const data = await res.json();
        setOngoAnimes(data.ongoing);
        setComplAnimes(data.complete);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAnimes();
  }, []);

  return (
    <main className="flex flex-col p-4 gap-y-4">
      <div>
        <h2 className="text-2xl font-bold">Ongoing Anime</h2>
        <ul className="grid grid-cols-7 gap-2 mt-4">
          {ongoAnimes?.map((oAnime, index: number) => {
            return (
              <li key={index} className="relative">
                <Image
                  src={oAnime.image}
                  alt={oAnime.title}
                  width={500}
                  height={500}
                  className="h-[240px] w-full object-cover rounded-md"
                />
                <h3>
                  <Link href={`anime/${oAnime.slug}`}>
                    {oAnime.title.slice(0, 20)}
                  </Link>
                </h3>
                <p className="absolute top-1 left-1 bg-black px-1 rounded text-white">
                  {oAnime.episode}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-bold">Completed Anime</h2>
        <ul className="grid grid-cols-7 gap-2 mt-4">
          {complAnimes?.map((cAnime, index: number) => {
            return (
              <li key={index} className="relative">
                <Image
                  src={cAnime.image}
                  alt={cAnime.title}
                  width={500}
                  height={500}
                  className="h-[240px] w-full object-cover rounded-md"
                />
                <h3>
                  <Link href={`anime/${cAnime.slug}`}>
                    {cAnime.title.slice(0, 20)}
                  </Link>
                </h3>
                <p className="absolute top-1 left-1 bg-black px-1 rounded text-white">
                  {cAnime.episode}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
