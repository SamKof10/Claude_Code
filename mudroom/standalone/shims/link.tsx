"use client";

import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { useRoute } from "../router";

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
}

/** Stand-in for next/link that drives the hash router. */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, children, onClick, ...rest },
  ref,
) {
  const { navigate } = useRoute();
  const target = href.startsWith("#") ? href : `#${href}`;

  return (
    <a
      ref={ref}
      href={target}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export default Link;
