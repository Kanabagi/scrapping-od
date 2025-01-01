'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

interface JadwalRilis {
  day: string;
  list: [
    {
      title: string;
      slug: string;
    }
  ];
}

export default function JadwalRilisPage() {
  const [jadwal, setJadwal] = useState<JadwalRilis[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/jadwal-rilis');
        const data = await res.data;
        setJadwal(data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Jadwal Rilis</h2>
      <ul className="space-y-2">
        {jadwal.map((j, index) => {
          return (
            <li key={index}>
              <div className=" border p-2">
                <p>#{j.day}</p>
                <div className="grid grid-cols-3">
                  {j.list.map((l, index) => {
                    return <p key={index}>{l.title}</p>;
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
