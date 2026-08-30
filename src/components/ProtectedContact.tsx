import React, { useMemo } from 'react';
import { Mail } from 'lucide-react';

interface ProtectedContactProps {
  type?: 'phone' | 'email';
  className?: string;
  title?: string;
}

export const ProtectedContact: React.FC<ProtectedContactProps> = ({
  className = '',
  title = 'Написати листа автору',
}) => {
  // Assembled dynamically to protect from plain-text spam scrapers
  const email = useMemo(() => {
    const user = 'saldan1978';
    const domain = 'gmail.com';
    return `${user}@${domain}`;
  }, []);

  return (
    <a
      href={`mailto:${email}`}
      rel="nofollow noopener noreferrer"
      title={title}
      className={className}
    >
      <Mail className="w-3.5 h-3.5 shrink-0 text-sky-400" />
      <span>{email}</span>
    </a>
  );
};
