export default function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="mb-2 block text-[17px] font-medium">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-[15px] text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-2 text-[15px] text-muted">{hint}</p>
      )}
    </div>
  )
}