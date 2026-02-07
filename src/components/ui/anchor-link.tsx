'use client';

import Link from 'next/link';
import { ComponentProps, MouseEvent } from 'react';

interface AnchorLinkProps extends ComponentProps<typeof Link> {}

/**
 * AnchorLink - A custom link component that handles anchor scrolling properly.
 *
 * Next.js's Link component doesn't scroll to the anchor when the hash is already
 * in the URL. This component fixes that by manually scrolling to the target element
 * when the link is clicked.
 */
export function AnchorLink({ href, onClick, ...props }: AnchorLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call the original onClick if provided
    onClick?.(e);

    // If it's an anchor link, manually scroll to the target
    if (typeof href === 'string' && href.startsWith('#')) {
      const targetId = href.slice(1);
      const element = document.getElementById(targetId);

      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth' });
        // Update the URL hash without triggering a navigation
        window.history.pushState(null, '', href);
      }
    }
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
