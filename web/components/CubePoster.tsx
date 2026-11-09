export function CubePoster() {
  const s = 36;
  const kx = s * 0.866;
  const ky = s * 0.5;
  const face = (matrix: string, colors: string[]) => (
    <g transform={`matrix(${matrix})`}>
      <rect width="3" height="3" fill="#0b0b0b" />
      {colors.map((c, i) => (
        <rect key={i} x={(i % 3) + 0.06} y={Math.floor(i / 3) + 0.06} width="0.88" height="0.88" rx="0.14" fill={c} />
      ))}
    </g>
  );
  const top = ['#F4F4F4', '#009E60', '#FF5800', '#FFD500', '#F4F4F4', '#0051BA', '#C41E3A', '#F4F4F4', '#FFD500'];
  const left = ['#C41E3A', '#F4F4F4', '#0051BA', '#FF5800', '#C41E3A', '#009E60', '#FFD500', '#C41E3A', '#F4F4F4'];
  const right = ['#0051BA', '#FFD500', '#C41E3A', '#009E60', '#0051BA', '#F4F4F4', '#FF5800', '#FFD500', '#0051BA'];
  const ox = 200;
  const oy = 70;
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label="Cubo de Rubik con los colores originales">
      {face(`${kx} ${ky} ${-kx} ${ky} ${ox} ${oy}`, top)}
      {face(`${kx} ${ky} 0 ${s} ${ox - 3 * kx} ${oy + 3 * ky}`, left)}
      {face(`${kx} ${-ky} 0 ${s} ${ox} ${oy + 6 * ky}`, right)}
    </svg>
  );
}

