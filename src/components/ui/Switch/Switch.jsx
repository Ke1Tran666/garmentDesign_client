// components/ui/Switch/Switch.jsx

const Switch = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        relative h-6 w-11 rounded-full transition
        ${checked ? "bg-brand!" : "bg-gray-300!"}
      `}
    >
      <span
        className={`
          absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface! transition
          ${checked ? "translate-x-5" : ""}
        `}
      />
    </button>
  );
};

export default Switch;