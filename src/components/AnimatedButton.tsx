'use client';

type AnimatedButtonProps = {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  ghost?: boolean;
  onClick?: () => void;
  className?: string;
};

export function AnimatedButton({
  text = 'Button',
  backgroundColor = '#0052FF',
  textColor = '#ffffff',
  ghost = false,
  onClick,
  className = '',
}: AnimatedButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ color: textColor }}
      className={`group relative flex h-[2.5rem] w-fit items-center gap-2 overflow-hidden rounded-lg px-4 py-1 font-sans font-medium transition-all duration-200 active:scale-95 ${className}`}
    >
      <div
        style={{ backgroundColor }}
        className={`pointer-events-none absolute inset-0 h-full w-full ${
          ghost ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-200 group-hover:opacity-100`}
      />
      <div className="z-10 whitespace-nowrap text-[0.9375rem]">{text}</div>
      <div className="flex z-10 justify-start items-center w-5 h-5 opacity-100 transition-all duration-300">
        <span className="flex-shrink-0">&#8594;</span>
      </div>
    </button>
  );
}
