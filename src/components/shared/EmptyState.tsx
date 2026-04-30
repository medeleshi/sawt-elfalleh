// src/components/shared/EmptyState.tsx

interface Props {
  title?: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title = 'لا توجد نتائج',
  description = 'جرّب تغيير معايير البحث أو الفلترة',
  icon = '🌾',
  action,
  className,
}: Props) {
  return (
    <div className={`empty-state ${className || ''}`} dir="rtl">
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
