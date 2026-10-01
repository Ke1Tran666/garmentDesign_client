const AuthBackground = () => {
  return (
    <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_20%_50%,#1a6fe8_0%,#0a52c4_40%,#0038a0_100%)]">
      <div className="absolute top-[5%] left-[8%] h-50 w-50 animate-float1 rounded-[40%_60%_70%_30%/50%_60%_40%_50%] bg-[#3a9fff] opacity-25" />

      <div className="absolute top-[15%] right-[10%] h-35 w-35 animate-float2 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-[#60baff] opacity-25" />

      <div className="absolute bottom-[20%] left-[15%] h-25 w-25 animate-[float1_12s_ease-in-out_infinite_reverse] rounded-[50%_60%_40%_70%/40%_50%_60%_50%] bg-[#2080ff] opacity-25" />

      <div className="absolute right-[8%] bottom-[10%] h-20 w-45 animate-[float2_9s_ease-in-out_infinite] rounded-[60%_40%_50%_60%/40%_60%_40%_60%] bg-auth-accent opacity-25" />

      <div className="absolute top-[40%] left-[5%] h-30 w-17.5 animate-[float1_11s_ease-in-out_infinite_2s] rounded-[40%_60%_50%_50%/60%_40%_60%_40%] bg-[#50a8ff] opacity-25" />

      <div className="absolute top-[55%] right-[5%] h-22.5 w-22.5 animate-[float2_7s_ease-in-out_infinite_1s] rounded-full bg-[#90ccff] opacity-25" />
    </div>
  );
};

export default AuthBackground;
