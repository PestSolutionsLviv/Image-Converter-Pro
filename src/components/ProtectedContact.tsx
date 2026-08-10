import React, { useState, useEffect } from 'react';
import { Phone, Mail } from 'lucide-react';

interface ProtectedContactProps {
  type: 'phone' | 'email';
  className?: string;
  title?: string;
}

export const ProtectedContact: React.FC<ProtectedContactProps> = ({
  type,
  className = '',
  title,
}) => {
  const [href, setHref] = useState<string>('#');
  const [displayText, setDisplayText] = useState<string>('Завантаження...');

  useEffect(() => {
    // Obfuscated Base64 strings to prevent automated email & phone harvesting by spambots
    // 'c2FsZGFuMTk3OEBnbWFpbC5jb20=' = 'saldan1978@gmail.com'
    // 'KzM4MDY3NjcwNjQwMg==' = '+380676706402'
    const encEmail = 'c2FsZGFuMTk3OEBnbWFpbC5jb20=';
    const encPhone = 'KzM4MDY3NjcwNjQwMg==';

    try {
      if (type === 'email') {
        const decodedEmail = atob(encEmail);
        setHref(`mailto:${decodedEmail}`);
        setDisplayText(decodedEmail);
      } else {
        const decodedPhone = atob(encPhone);
        setHref(`tel:${decodedPhone}`);
        setDisplayText('+38 067 670 64 02');
      }
    } catch (e) {
      console.warn('Could not decode contact info', e);
    }
  }, [type]);

  const Icon = type === 'email' ? Mail : Phone;

  return (
    <a
      href={href}
      rel="nofollow noopener noreferrer"
      title={title}
      className={className}
      onClick={(e) => {
        if (href === '#') {
          e.preventDefault();
        }
      }}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${type === 'email' ? 'text-sky-400' : 'text-emerald-500'}`} />
      <span>{displayText}</span>
    </a>
  );
};
