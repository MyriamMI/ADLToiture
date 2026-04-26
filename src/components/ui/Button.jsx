export default function Button({ children, variant = 'primary', onClick, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`btn btn--${variant}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
