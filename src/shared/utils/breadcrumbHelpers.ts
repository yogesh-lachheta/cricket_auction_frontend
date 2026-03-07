import type { BreadcrumbItem } from '@shared/components/Breadcrumb';

export const generateBreadcrumbs = (
  path: string,
  customLabel?: string
): BreadcrumbItem[] => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Dashboard is always the first item
  breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });

  // Players routes
  if (segments[0] === 'players') {
    breadcrumbs.push({ label: 'Players', href: '/players' });

    if (segments[1] === 'create') {
      breadcrumbs.push({ label: 'Add New Player' });
    } else if (segments[2] === 'edit') {
      breadcrumbs.push({ label: customLabel || 'Edit Player' });
    }
  }

  // Teams routes
  else if (segments[0] === 'teams') {
    breadcrumbs.push({ label: 'Teams', href: '/teams' });

    if (segments[1] === 'create') {
      breadcrumbs.push({ label: 'Create New Team' });
    } else if (segments[1] && segments[1] !== 'create') {
      breadcrumbs.push({ label: customLabel || 'Team Details' });
    }
  }

  // Auctions routes
  else if (segments[0] === 'auctions') {
    breadcrumbs.push({ label: 'Auctions', href: '/auctions' });

    if (segments[1] === 'create') {
      breadcrumbs.push({ label: 'Create New Auction' });
    } else if (segments[2] === 'configure') {
      breadcrumbs.push({ label: customLabel || 'Configure Auction' });
    } else if (segments[2] === 'live') {
      breadcrumbs.push({ label: customLabel || 'Live Bidding' });
    }
  }

  return breadcrumbs;
};
