export default function Section({ 
  children, 
  className = "",
  id,
  background = "transparent"
}) {
  const backgroundStyles = {
    transparent: "",
    dark: "bg-charcoal-light/30",
    gradient: "bg-magical-glow",
  }

  return (
    <section 
      id={id}
      className={`
        relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8
        ${backgroundStyles[background] || backgroundStyles.transparent}
        ${className}
      `}
    >
      {/* Background gradient overlay */}
      {background === "gradient" && (
        <div className="absolute inset-0 bg-magical-glow opacity-30 pointer-events-none" />
      )}
      
      {/* Content container */}
      <div className="relative max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  )
}
