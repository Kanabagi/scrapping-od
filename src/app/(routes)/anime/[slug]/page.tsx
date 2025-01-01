'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface Anime {
  title: string;
  imageUrl: string;
  details: {
    judul: string;
    japanese: string;
    skor: string;
    produser: string;
    tipe: string;
    status: string;
    totalepisode: string;
    durasi: string;
    tanggalrilis: string;
    studio: string;
    genre: string;
  };
  batch: [
    {
      title: string;
      url: string;
      date: string;
    }
  ];
  single: [
    {
      title: string;
      url: string;
      date: string;
    }
  ];
  lengkap: [
    {
      title: string;
      url: string;
      date: string;
    }
  ];
}

export default function AnimeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [anime, setAnime] = useState<Anime>();

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await fetch(`/api/anime/${slug}`);
        const data = await res.json();
        setAnime(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAnime();
  }, [slug]);

  return (
    <div className="p-4">
      {anime && (
        <div className="flex flex-col gap-y-2">
          <div className="flex gap-x-2">
            <Image
              src={anime?.imageUrl}
              alt={anime?.title}
              height={500}
              width={500}
              className="h-[250px] w-[180px] object-cover rounded-md"
            />
            <div>
              <h2>{anime.details.judul}</h2>
              <p>{anime.details.japanese}</p>
              <p>{anime.details.durasi}</p>
              <p>{anime.details.tanggalrilis}</p>
              <p>{anime.details.totalepisode}</p>
            </div>
          </div>
          <div className="flex flex-col">
            Batch
            {anime.batch.length ? (
              anime.batch.map((b, index) => {
                return (
                  <Link key={index} href={b.url}>
                    {b.title}
                  </Link>
                );
              })
            ) : (
              <p>Batch belum ada</p>
            )}
          </div>
          <div className="flex flex-col">
            <h3>Episode</h3>
            {anime.single.map((s, index) => {
              return (
                <Link key={index} href={s.url}>
                  {s.title}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-col">
            <h3>Lengkap</h3>
            {anime.lengkap.length ? (
              anime.lengkap.map((l, index) => {
                return (
                  <Link key={index} href={l.url}>
                    {l.title}
                  </Link>
                );
              })
            ) : (
              <p>Lengkap belum ada</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
