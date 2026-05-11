export function PageHeader({ title, subtitle, breadcrumb, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-gris-200">
      <div>
        {breadcrumb && (
          <p className="text-xs text-gris-500 mb-1">
            {breadcrumb.map((b, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1.5 text-gris-300">›</span>}
                <span className={i === breadcrumb.length - 1 ? 'text-gris-950 font-medium' : ''}>
                  {b}
                </span>
              </span>
            ))}
          </p>
        )}
        <h1 className="text-xl font-bold text-gris-950">{title}</h1>
        {subtitle && <p className="text-sm text-gris-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
