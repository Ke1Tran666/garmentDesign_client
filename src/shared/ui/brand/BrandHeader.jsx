import Logo from "./Logo";

const BrandHeader = ({ subtitle }) => {
  return (
    <>
      {/* LOGO */}
      <div className="mb-7 text-center">
        <Logo className="justify-center" />

        <p className="mt-2 text-xs font-light tracking-[0.4px] text-white/55">
          {subtitle}
        </p>
      </div>
    </>
  );
};

export default BrandHeader;
