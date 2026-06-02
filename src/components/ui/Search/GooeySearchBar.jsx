import { GooeyInput } from "./GooeyInput";

const GooeySearchBar = () => {
  return (
    <div className="flex items-center justify-center">
      <GooeyInput
        placeholder="Tìm kiếm ..."
        collapsedWidth={145}
        expandedWidth={250}
        expandedOffset={60}
        classNames={{
          trigger:
            "h-10 rounded-full bg-brand! text-white! ring-0! shadow-none!",
          input:
            "text-white! placeholder:text-white/55!",
          bubble:
            "size-13!",
          bubbleSurface:
            "size-10 bg-brand! text-white! ring-0! shadow-none!",
        }}
      />
    </div>
  )
}

export default GooeySearchBar