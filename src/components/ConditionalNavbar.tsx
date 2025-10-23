'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isHiringRoute = pathname.startsWith('/hiring');
  
  if (isHiringRoute) {
    return null;
  }
  
  return <Navbar />;
}
