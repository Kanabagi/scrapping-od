import Link from 'next/link';

const NAV_LIST = [
  { name: 'Home', href: '/' },
  { name: 'Ongoing', href: '/ongoing' },
  { name: 'Complete', href: '/complete' },
  { name: 'Anime List', href: '/anime-list' },
  { name: 'Jadwal Rilis', href: '/jadwal-rilis' },
  { name: 'Genre List', href: '/genres' },
];

export default function Navbar() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1>KontolNime</h1>
      <nav>
        <ul className="flex items-center gap-x-4">
          {NAV_LIST.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
