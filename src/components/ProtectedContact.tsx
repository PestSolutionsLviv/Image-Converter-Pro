import React, { useMemo } from 'react';
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
  // Obfuscated string assembly using String.fromCharCode to hide '@' and raw numbers from static HTML scrapers & spambots
  const { href, text } = useMemo(() => {
    if (type === 'email') {
      const at = String.fromCharCode(64);
      const user = ['saldan', '1978'].join('');
      const domain = ['gmail', 'com'].join('.');
      const fullEmail = `${user}${at}${domain}`;
      return {
        href: `mailto:${fullEmail}`,
        text: fullEmail,
      };
    } else {
      const p1 = '+380';
      const p2 = '67';
      const p3 = '670';
      const p4 = '6402';
      const fullPhone = `${p1}${p2}${p3}${p4}`;
      const formatted = `+38 067 670 64 02`;
      return {
        href: `tel:${fullPhone}`,
        text: formatted,
      };
    }
  }, [type]);

  const Icon = type === 'email' ? Mail : Phone;

  return (
    <a
      href={href}
      rel="nofollow noopener noreferrer"
      title={title}
      className={className}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${type === 'email' ? 'text-sky-400' : 'text-emerald-500'}`} />
      <span>{text}</span>
    </a>
  );
};
