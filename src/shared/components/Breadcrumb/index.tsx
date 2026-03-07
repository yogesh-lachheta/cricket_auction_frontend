import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbProps } from './Breadcrumb.types';

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return null;
  }

  const handleClick = (href: string) => {
    navigate(href);
  };

  return (
    <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          )}

          {item.href ? (
            <button
              onClick={() => handleClick(item.href!)}
              className="text-text-muted hover:text-primary transition-colors font-medium"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-primary font-semibold">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
export type { BreadcrumbItem, BreadcrumbProps } from './Breadcrumb.types';
