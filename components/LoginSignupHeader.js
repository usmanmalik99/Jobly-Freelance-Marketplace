import { useRouter } from "next/router";

const LoginSignupHeader = () => {
  const router = useRouter();

  return (
    <header className="border-b">
      <nav className="container mx-auto py-3 px-3 flex lg:justify-start justify-center">
        <div
          className="cursor-pointer select-none"
          role="button"
          aria-label="Jobly Home"
          onClick={() => router.push("/")}
        >
          <span className="text-xl font-extrabold text-[#0C4A6E] tracking-tight">
            Jobly
          </span>
        </div>
      </nav>
    </header>
  );
};

export default LoginSignupHeader;
