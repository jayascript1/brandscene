import React, { useEffect, useRef } from 'react';

interface SkipLinkProps {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({ targetId, children, className = '' }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    };

    link.addEventListener('click', handleClick);
    return () => link.removeEventListener('click', handleClick);
  }, [targetId]);

  return (
    <a
      ref={linkRef}
      href={`#${targetId}`}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
    >
      {children}
    </a>
  );
};

export default SkipLink;
