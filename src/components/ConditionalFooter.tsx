'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isHiringRoute = pathname.startsWith('/hiring');
  
  if (isHiringRoute) {
    return null;
  }
  
  return <Footer />;
}
