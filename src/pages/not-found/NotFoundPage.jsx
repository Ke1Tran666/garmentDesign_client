import {
  ArrowLeft,
  House,
  PackageOpen,
  Scissors,
  Shirt,
  Sparkles,
} from "lucide-react";
import { Link, useLocation, useNavigate} from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dùng khi chuyển từ một tính năng chưa phát triển.
  const featureName = location.state?.feature;

  return (
    <main
      className="
        relative flex min-h-screen
        items-center justify-center
        overflow-hidden
        bg-surface-subtle
        px-4 py-12
      "
    >
      {/* Background decoration */}
      <div
        className="
          pointer-events-none absolute
          -left-32 -top-32
          h-80 w-80 rounded-full
          bg-brand/10 blur-3xl
        "
      />

      <div
        className="
          pointer-events-none absolute
          -bottom-40 -right-32
          h-96 w-96 rounded-full
          bg-indigo-500/10 blur-3xl
        "
      />

      <section
        className="
          relative z-10
          flex w-full max-w-2xl
          flex-col items-center
          text-center
        "
      >
        {/* 404 illustration */}
        <div
          className="
            relative mb-5
            flex h-64 w-full
            max-w-lg items-center justify-center
          "
          aria-hidden="true"
        >
          {/* Large background 404 */}
          <span
            className="
              absolute inset-0
              flex items-center justify-center
              font-heading
              text-[9rem] font-bold leading-none
              tracking-tighter
              text-text-subtle/10
              sm:text-[12rem]
            "
          >
            404
          </span>

          {/* Center illustration */}
          <div
            className="
              relative z-10
              flex h-44 w-44
              items-center justify-center
            "
          >
            <PackageOpen
              size={142}
              strokeWidth={1.35}
              className="
                text-text-strong
                drop-shadow-[0_12px_15px_rgb(15_23_42/0.12)]
              "
            />

            <div
              className="
                absolute left-2 top-1
                flex h-12 w-12
                -rotate-12 items-center justify-center
                rounded-xl border-2 border-text-strong
                bg-surface shadow-md
                animate-[float_4s_ease-in-out_infinite]
              "
            >
              <Shirt
                size={25}
                strokeWidth={1.7}
                className="text-text-strong"
              />
            </div>

            <div
              className="
                absolute right-0 top-7
                flex h-11 w-11
                rotate-12 items-center justify-center
                rounded-xl border-2 border-text-strong
                bg-surface shadow-md
                animate-float
              "
            >
              <Scissors
                size={23}
                strokeWidth={1.7}
                className="text-text-strong"
              />
            </div>

            <Sparkles
              size={22}
              className="
                absolute right-7 top-0
                text-brand
                animate-pulse
              "
            />
          </div>
        </div>

        {/* Message */}
        <span
          className="
            mb-4 inline-flex
            items-center rounded-full
            border border-brand/20
            bg-brand-soft px-4 py-1.5
            text-sm font-semibold text-brand
          "
        >
          Lỗi 404
        </span>

        <h1
          className="
            font-heading
            text-3xl font-bold
            tracking-tight text-text-strong
            sm:text-4xl
          "
        >
          Oops! Bạn đang đi lạc rồi
        </h1>

        <p
          className="
            mt-4 max-w-lg
            text-sm leading-6 text-text-muted
            sm:text-base sm:leading-7
          "
        >
          {featureName ? (
            <>
              Tính năng{" "}
              <strong className="font-semibold text-text-default">
                “{featureName}”
              </strong>{" "}
              hiện chưa tồn tại hoặc vẫn đang trong quá trình phát triển.
              Vui lòng quay lại sau.
            </>
          ) : (
            <>
              Đường dẫn bạn vừa truy cập không tồn tại, đã được thay đổi
              hoặc tính năng này vẫn đang trong quá trình phát triển.
            </>
          )}
        </p>

        {/* Actions */}
        <div
          className="
            mt-8 flex w-full
            flex-col items-center justify-center
            gap-3 sm:w-auto sm:flex-row
          "
        >
          <Link
            to="/"
            className="
              inline-flex w-full
              items-center justify-center gap-2
              rounded-xl bg-brand
              px-6 py-3
              text-sm font-semibold text-white
              shadow-lg shadow-brand/20
              transition
              hover:-translate-y-0.5
              hover:bg-brand-hover
              hover:shadow-xl
              active:translate-y-0
              sm:w-auto
            "
          >
            <House size={18} />
            Về trang chủ
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              inline-flex w-full
              items-center justify-center gap-2
              rounded-xl border border-border
              bg-surface px-6 py-3
              text-sm font-semibold text-text-default
              shadow-sm transition
              hover:-translate-y-0.5
              hover:border-brand/40
              hover:text-brand
              hover:shadow-md
              active:translate-y-0
              sm:w-auto
            "
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;