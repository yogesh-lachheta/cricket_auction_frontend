import { Breadcrumb } from '@shared/components';
import type { BreadcrumbItem } from '@shared/components';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
};

export const PageHeader = ({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) => {
  return (
    <div className="mb-8">
      {/* Title and Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-text-main">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-muted mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}
    </div>
  );
};

export default PageHeader;
