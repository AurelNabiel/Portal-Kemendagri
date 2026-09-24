import Image from 'next/image';

export default function Emblem({ size = 'md', className = '' }) {
  const dim = size === 'sm' ? 'h-12 w-12' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  const px = size === 'sm' ? 36 : size === 'lg' ? 56 : 44;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden  ${dim} ${className}`}
      aria-hidden
    >
      <Image
        src="kemendagri.svg"
        alt="Logo Kementerian Dalam Negeri"
        width={px}
        height={px}
        priority
        className="h-full w-full object-contain p-1"
      />
    </span>
  );
}