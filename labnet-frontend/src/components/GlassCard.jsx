const GlassCard = ({ children, className = '', hover = true, ...props }) => {
  const base = 'glass-card p-6 transition-all duration-300';
  const hoverClass = hover ? 'hover:scale-[1.02] hover:shadow-xl' : '';
  return (
    <div className={`${base} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
export default GlassCard;