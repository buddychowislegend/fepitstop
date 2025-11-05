'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isHiringRoute = pathname.startsWith('/hiring');
  const isContestRoute = pathname.startsWith('/contest');
  
  if (isHiringRoute || isContestRoute) {
    return null;
  }
  
  return <Footer />;
}
