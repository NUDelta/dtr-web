const CityHoverLabel = ({ city }: { city: string }) => {
  const padX = 6
  const text = city
  const w = Math.min(220, Math.max(60, text.length * 7 + padX * 2))
  const h = 20
  return (
    <g transform="translate(8,-10)" pointerEvents="none">
      <rect width={w} height={h} rx={4} ry={4} fill="white" stroke="#E5E7EB" />
      <text x={padX} y={14} fontSize={12} fill="#111827">{text}</text>
    </g>
  )
}

export default CityHoverLabel
