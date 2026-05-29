import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BackHomeButton = ({
  to = "/",
  children = "Trở về trang chủ",
  className = "",
}) => {
  return (
    <Link
      to={to}
      className={`
        fixed bottom-6 left-6 z-50
        flex items-center gap-2
        rounded-2xl border border-white/20
        bg-white/10 px-5 py-3
        text-sm font-medium text-white
        backdrop-blur-xl
        transition-all duration-300
        hover:-translate-y-1
        hover:bg-white/20
        ${className}
      `}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  );
};

export default BackHomeButton;