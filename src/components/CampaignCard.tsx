import Link from 'next/link';
import { ProgressBar } from './ProgressBar';
import { formatMoney } from '@/lib/format';
import type { CampaignStatus } from '@/types/db';

interface CampaignCardProps {
  title: string;
  goalCents: number;
  raisedCents: number;
  href: string;
  status?: CampaignStatus;
  className?: string;
}

export function CampaignCard({
  title,
  goalCents,
  raisedCents,
  href,
  status,
  className = ''
}: CampaignCardProps) {
  const percentRaised = Math.min(100, Math.floor((raisedCents / goalCents) * 100));
  
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    pending_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    suspended: 'bg-orange-100 text-orange-800',
    completed: 'bg-blue-100 text-blue-800',
  };
  
  return (
    <Link 
      href={href}
      className={`block p-6 rounded-xl border hover:border-purple-300 transition-colors shadow-sm bg-white ${className}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-xl line-clamp-2 flex-1">
          {title}
        </h3>
        {status && (
          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${statusColors[status]}`}>
            {status.replace('_', ' ')}
          </span>
        )}
      </div>
      
      <ProgressBar 
        value={percentRaised} 
        className="mb-3"
      />
      
      <div className="flex justify-between text-base text-gray-700">
        <span>{formatMoney(raisedCents / 100)} raised</span>
        <span>{formatMoney(goalCents / 100)} goal</span>
      </div>
    </Link>
  );
}