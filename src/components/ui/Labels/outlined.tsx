export const OutlinedBadge = ({
  color,
  label,
}: {
  color: string
  label: string
}) => {
  return (
    <div
      className="px-2 text-xs font-mono py-[0.1rem] uppercase rounded-xl border"
      style={{
        color: color,
        borderColor: color,
      }}
    >
      {label}
    </div>
  )
}
