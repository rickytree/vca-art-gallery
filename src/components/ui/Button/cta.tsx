export const CTAButton = ({
  label,
  cta_action,
  bg_color = 'black',
  text_color = 'white',
}: {
  label: string
  cta_action: any
  bg_color?: string
  text_color?: string
}) => {
  return (
    <button
      className={`block ml-auto mt-6 px-8 py-2 rounded-md w-fit`}
      style={{
        backgroundColor: bg_color,
        color: text_color,
      }}
      onClick={cta_action}
    >
      {label}
    </button>
  )
}
