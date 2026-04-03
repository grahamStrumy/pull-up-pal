type OptionCardProps = {
  label: string;
  detail?: string;
  selected: boolean;
  onClick: () => void;
};

export function OptionCard({ label, detail, selected, onClick }: OptionCardProps) {
  return (
    <button
      className={`option-card${selected ? ' is-selected' : ''}`}
      onClick={onClick}
      type="button"
    >
      <span className="option-card__label">{label}</span>
      {detail ? <span className="option-card__detail">{detail}</span> : null}
    </button>
  );
}
