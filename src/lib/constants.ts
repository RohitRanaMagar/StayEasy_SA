// Status color mappings
export const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-600' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  unpaid: { bg: 'bg-red-50', text: 'text-red-600' },
  overdue: { bg: 'bg-red-50', text: 'text-red-600' },
};

// Priority color mappings
export const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-blue-50', text: 'text-blue-700' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700' },
  critical: { bg: 'bg-red-50', text: 'text-red-700' },
};

// Category color mappings
export const categoryColors: Record<string, { bg: string; text: string }> = {
  billing: { bg: 'bg-purple-50', text: 'text-purple-700' },
  technical: { bg: 'bg-blue-50', text: 'text-blue-700' },
  feature: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  compliance: { bg: 'bg-amber-50', text: 'text-amber-700' },
  general: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

// Standard table header classes
export const tableHeaderClasses = 'border-b border-gray-100 bg-gray-50/50';
export const tableHeaderTextClasses = 'text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3';
export const tableRowClasses = 'border-b border-gray-50 hover:bg-gray-50/50 transition-colors';
