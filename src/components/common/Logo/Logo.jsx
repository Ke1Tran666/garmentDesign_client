import { Scissors } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = ({
  to = "/",
  textColor = "text-text-primary",
  className = "",
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center justify-center gap-2.5 font-brand ${className}`}
    >
      <div
        className="
          flex h-9 w-9 items-center justify-center
          rounded-xl bg-brand
          shadow-[0_4px_15px_rgba(1,146,245,0.3)]
        "
      >
        <Scissors className="text-white" />
      </div>

      <span className={`font-brand text-xl font-semibold ${textColor}`}>
        HoaTran <span className="text-brand">maymac</span>
      </span>
    </Link>
  );
};

export default Logo;