const AuthBackground = () => {
  return (
    <div
      className="
        fixed inset-0 z-0
        bg-[radial-gradient(ellipse_at_20%_50%,#1a6fe8_0%,#0a52c4_40%,#0038a0_100%)]
      "
    >
      <div
        className="
          absolute left-[8%] top-[5%] h-50 w-50
          rounded-[40%_60%_70%_30%/50%_60%_40%_50%]
          bg-[#3a9fff] opacity-25 animate-float1
        "
      />

      <div
        className="
          absolute right-[10%] top-[15%] h-35 w-35
          rounded-[60%_40%_30%_70%/60%_30%_70%_40%]
          bg-[#60baff] opacity-25 animate-float2
        "
      />

      <div
        className="
          absolute bottom-[20%] left-[15%] h-25 w-25
          rounded-[50%_60%_40%_70%/40%_50%_60%_50%]
          bg-[#2080ff] opacity-25
          animate-[float1_12s_ease-in-out_infinite_reverse]
        "
      />

      <div
        className="
          absolute bottom-[10%] right-[8%]
          h-20 w-45
          rounded-[60%_40%_50%_60%/40%_60%_40%_60%]
          bg-auth-accent opacity-25
          animate-[float2_9s_ease-in-out_infinite]
        "
      />

      <div
        className="
          absolute left-[5%] top-[40%]
          h-30 w-17.5
          rounded-[40%_60%_50%_50%/60%_40%_60%_40%]
          bg-[#50a8ff] opacity-25
          animate-[float1_11s_ease-in-out_infinite_2s]
        "
      />

      <div
        className="
          absolute right-[5%] top-[55%]
          h-22.5 w-22.5 rounded-full
          bg-[#90ccff] opacity-25
          animate-[float2_7s_ease-in-out_infinite_1s]
        "
      />
    </div>
  );
};

export default AuthBackground;