export default function page() {
  return (
    <div className="p-2 flex flex-col gap-y-2">
      <div>
        <p className="text-lg font-medium mb-1 text-neutral-900">
          Get All Anime
        </p>
        <p className="bg-neutral-200 px-4 py-1 text-neutral-700 rounded-full w-fit">
          https://vv6-kananime.vercel.app/api/anime
        </p>
      </div>
      <div>
        <p className="text-lg font-medium mb-1 text-neutral-900">
          Get Completed Anime
        </p>
        <p className="bg-neutral-200 px-4 py-1 text-neutral-700 rounded-full w-fit">
          https://vv6-kananime.vercel.app/api/anime/completed
        </p>
      </div>
      <div>
        <p className="text-lg font-medium mb-1 text-neutral-900">
          Get Ongoing Anime
        </p>
        <p className="bg-neutral-200 px-4 py-1 text-neutral-700 rounded-full w-fit">
          https://vv6-kananime.vercel.app/api/anime/ongoing
        </p>
      </div>
      <div>
        <p className="text-lg font-medium mb-1 text-neutral-900">
          Search Anime
        </p>
        <p className="bg-neutral-200 px-4 py-1 text-neutral-700 rounded-full w-fit">
          https://vv6-kananime.vercel.app/api/anime/search/{'{query}'}
        </p>
      </div>
      <div>
        <p className="text-lg font-medium mb-1 text-neutral-900">
          Get Detail Anime
        </p>
        <p className="bg-neutral-200 px-4 py-1 text-neutral-700 rounded-full w-fit">
          https://vv6-kananime.vercel.app/api/anime/{'{slug}'}
        </p>
      </div>
      <div>
        <p className="text-lg font-medium mb-1 text-neutral-900">
          Download Batch Anime
        </p>
        <p className="bg-neutral-200 px-4 py-1 text-neutral-700 rounded-full w-fit">
          https://vv6-kananime.vercel.app/api/download/batch/{'{slug}'}
        </p>
      </div>
      <div>
        <p className="text-lg font-medium mb-1 text-neutral-900">
          Download Episode Anime
        </p>
        <p className="bg-neutral-200 px-4 py-1 text-neutral-700 rounded-full w-fit">
          https://vv6-kananime.vercel.app/api/download/episode/{'{slug}'}
        </p>
      </div>
      <div>
        <p className="text-lg font-medium mb-1 text-neutral-900">
          Get All Genre
        </p>
        <p className="bg-neutral-200 px-4 py-1 text-neutral-700 rounded-full w-fit">
          https://vv6-kananime.vercel.app/api/genres
        </p>
      </div>
      <div>
        <p className="text-lg font-medium mb-1 text-neutral-900">
          Get Genre Tertentu
        </p>
        <p className="bg-neutral-200 px-4 py-1 text-neutral-700 rounded-full w-fit">
          https://vv6-kananime.vercel.app/api/genres/{'{slug}'}
        </p>
      </div>
    </div>
  );
}
