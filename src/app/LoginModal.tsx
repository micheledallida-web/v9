"use client";

import { Apple, ArrowLeft, ArrowRight, Check, ChevronDown, Eye, EyeOff, Github as GitHubIcon, KeyRound, Mail, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import countries from "world-countries";
import Q3DCanvas from "./Q3DCanvas";

type AuthStep = "options" | "email" | "phone" | "signin";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProviderAuth: (provider: string) => Promise<void> | void;
  onEmailSignUp: (payload: { name: string; email: string; password: string }) => Promise<void> | void;
  onEmailSignIn: (payload: { email: string; password: string }) => Promise<void> | void;
  onPhoneContinue: (payload: { name: string; dialCode: string; phone: string }) => Promise<void> | void;
  initialStep?: AuthStep;
};

type CountryOption = {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
};

function generateFlagEmoji(countryCode: string) {
  return String.fromCodePoint(...countryCode.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)));
}

function ProviderButton({
  provider,
  className,
  children,
  onProviderAuth,
}: {
  provider: string;
  className: string;
  children: React.ReactNode;
  onProviderAuth: (provider: string) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await onProviderAuth(provider);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? (
        <>
          <span className="btn-spinner mr-2" />
          Pending…
        </>
      ) : (
        children
      )}
    </button>
  );
}

const COUNTRY_OPTIONS: CountryOption[] = countries
  .map((country) => {
    const root = country.idd?.root ?? "";
    const suffix = country.idd?.suffixes?.[0] ?? "";
    if (!country.cca2 || !country.name?.common || !root || !suffix) return null;

    const dialCode = `${root}${suffix}`;
    const flag = country.flag || generateFlagEmoji(country.cca2);

    return {
      code: country.cca2,
      name: country.name.common,
      flag,
      dialCode,
    };
  })
  .filter((country): country is CountryOption => Boolean(country))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function LoginModal({ isOpen, onClose, onProviderAuth, onEmailSignUp, onEmailSignIn, onPhoneContinue, initialStep }: LoginModalProps) {
  const [authStep, setAuthStep] = useState<AuthStep>("options");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("IN");

  useEffect(() => {
    if (!isOpen) return;
    setAuthStep(initialStep ?? "options");
    setCountryDropdownOpen(false);
    setCountryQuery("");
  }, [isOpen, initialStep]);

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return COUNTRY_OPTIONS;
    return COUNTRY_OPTIONS.filter((country) => country.name.toLowerCase().includes(query) || country.dialCode.includes(query));
  }, [countryQuery]);

  const selectedCountry = useMemo(() => COUNTRY_OPTIONS.find((country) => country.code === selectedCountryCode) ?? COUNTRY_OPTIONS[0], [selectedCountryCode]);

  if (!isOpen) return null;

  function handleClose() {
    setAuthStep("options");
    setCountryDropdownOpen(false);
    setCountryQuery("");
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setSigninEmail("");
    setSigninPassword("");
    setShowSigninPassword(false);
    onClose();
  }

  const spinningQ = (
    <div className="mb-3 sm:mb-4 flex justify-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16">
        <Q3DCanvas className="w-full h-full" scale={0.7} />
      </div>
    </div>
  );

  const heading = (
    <h2 className="text-[clamp(1.2rem,5vw,2.4rem)] font-semibold leading-[1.1] tracking-tight text-center">
      Build Full-Stack
      <br />
      <span className="text-brandGreen">Web &amp; Mobile Apps in Minutes</span>
    </h2>
  );

  const footerLinks = (
    <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm leading-relaxed text-white/45">
      By continuing, you agree to our
      <br />
      <a href="#" className="underline underline-offset-4">
        Terms of Service
      </a>{" "}
      /{" "}
      <a href="#" className="underline underline-offset-4">
        Privacy Policy
      </a>
    </p>
  );

  const iconOnlyProviderButtonClass =
    "h-10 rounded-full border border-white/15 bg-brandSurfaceAccent flex items-center justify-center hover:border-white/30 transition disabled:opacity-60";

  return (
      <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center">
        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[28px] border border-brandBorder bg-brandSurface p-4 sm:p-6 text-white relative">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.05), transparent 45%)",
            }}
          />

          <div className="relative z-10">
            <div className="mb-3 sm:mb-4 flex items-center justify-start">
              <button
                onClick={handleClose}
                className="h-9 w-9 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition"
                aria-label="Close login modal"
              >
                ✕
              </button>
            </div>

            {authStep === "options" && (
              <div className="flex flex-col items-center">
                {spinningQ}
                {heading}

                <div className="mt-4 sm:mt-6 w-full space-y-2.5 sm:space-y-3">
                  <ProviderButton
                    provider="Google"
                    onProviderAuth={onProviderAuth}
                    className="w-full h-11 sm:h-12 rounded-full bg-white text-[#151515] text-sm sm:text-base font-semibold flex items-center justify-center gap-3 hover:bg-brandGreen transition disabled:opacity-60"
                  >
                    Continue with Google
                  </ProviderButton>

                  <div className="grid grid-cols-3 gap-2">
                    <ProviderButton
                      provider="GitHub"
                      onProviderAuth={onProviderAuth}
                      className={iconOnlyProviderButtonClass}
                    >
                      <GitHubIcon className="h-5 w-5 shrink-0 text-brandGreen" />
                    </ProviderButton>
                    <ProviderButton
                      provider="Apple"
                      onProviderAuth={onProviderAuth}
                      className={iconOnlyProviderButtonClass}
                    >
                      <Apple className="h-5 w-5 text-white" />
                    </ProviderButton>
                    <ProviderButton
                      provider="Facebook"
                      onProviderAuth={onProviderAuth}
                      className={iconOnlyProviderButtonClass}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0">
                        <circle cx="12" cy="12" r="10" fill="#1877F2" />
                        <path
                          d="M13.35 18v-5.47h1.84l.28-2.13h-2.12V9.04c0-.62.17-1.04 1.05-1.04h1.12V6.09c-.19-.03-.86-.09-1.63-.09-1.61 0-2.72.98-2.72 2.79v1.61H9.35v2.13h1.82V18h2.18Z"
                          fill="#FFFFFF"
                        />
                      </svg>
                    </ProviderButton>
                  </div>

                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-white/15" />
                    <span className="text-white/45 text-xs sm:text-sm font-medium tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-white/15" />
                  </div>

                  <button
                    onClick={() => setAuthStep("email")}
                    className="w-full h-11 sm:h-12 rounded-full border border-white/15 bg-brandSurfaceAccent text-sm sm:text-base font-semibold flex items-center justify-center hover:border-white/30 transition"
                  >
                    Continue with Email
                  </button>

                  <button
                    onClick={() => {
                      setAuthStep("phone");
                      setCountryDropdownOpen(false);
                    }}
                    className="w-full h-11 sm:h-12 rounded-full border border-white/15 bg-brandSurfaceAccent text-sm sm:text-base font-semibold flex items-center justify-center hover:border-white/30 transition"
                  >
                    Continue with Phone
                  </button>
                </div>

                {footerLinks}
              </div>
            )}

            {authStep === "email" && (
              <div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await onEmailSignUp({ name, email, password });
                  }}
                  className="space-y-3"
                >
                  <div className="h-11 rounded-full border border-white/15 bg-brandSurfaceAccent px-4 flex items-center gap-3">
                    <UserRound className="h-5 w-5 shrink-0 text-white/45" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-transparent text-sm sm:text-base placeholder:text-white/40 outline-none"
                    />
                  </div>

                  <div className="h-11 rounded-full border border-white/15 bg-brandSurfaceAccent px-4 flex items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-white/45" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-transparent text-sm sm:text-base placeholder:text-white/40 outline-none"
                    />
                  </div>

                  <div className="h-11 rounded-full border border-white/15 bg-brandSurfaceAccent px-4 flex items-center gap-3">
                    <KeyRound className="h-5 w-5 shrink-0 text-white/45" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm sm:text-base placeholder:text-white/40 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-white/45 hover:text-white/80 transition-colors shrink-0"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="pt-1 flex items-center gap-3">
                    <button
                      type="submit"
                      className="h-11 w-full rounded-full bg-white text-[#151515] text-sm sm:text-base font-semibold tracking-tight flex items-center justify-center gap-2"
                    >
                      Get Started <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {authStep === "signin" && (
              <div>
                <p className="mb-3 text-center text-sm sm:text-base font-medium text-white/85">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthStep("email")}
                    className="underline underline-offset-4 hover:text-brandGreen transition-colors"
                  >
                    Sign up
                  </button>
                </p>

                <div className="mb-4 flex flex-col items-center text-center">
                  {spinningQ}
                  {heading}
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await onEmailSignIn({ email: signinEmail, password: signinPassword });
                  }}
                  className="space-y-3"
                >
                  <div className="h-11 rounded-full border border-white/15 bg-brandSurfaceAccent px-4 flex items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-white/45" />
                    <input
                      type="email"
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-transparent text-sm sm:text-base placeholder:text-white/40 outline-none"
                    />
                  </div>

                  <div className="h-11 rounded-full border border-white/15 bg-brandSurfaceAccent px-4 flex items-center gap-3">
                    <KeyRound className="h-5 w-5 shrink-0 text-white/45" />
                    <input
                      type={showSigninPassword ? "text" : "password"}
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm sm:text-base placeholder:text-white/40 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSigninPassword((v) => !v)}
                      className="text-white/45 hover:text-white/80 transition-colors shrink-0"
                      aria-label={showSigninPassword ? "Hide password" : "Show password"}
                    >
                      {showSigninPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="text-right">
                    <a href="#" className="text-xs sm:text-sm text-white/50 hover:text-white/80 underline underline-offset-4 transition-colors">
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-full bg-white text-[#151515] text-sm sm:text-base font-semibold tracking-tight flex items-center justify-center gap-2"
                  >
                    Login <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthStep("options")}
                    className="w-full h-11 rounded-full border border-white/15 bg-brandSurfaceAccent text-sm sm:text-base font-semibold flex items-center justify-center hover:border-white/30 transition"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
                  </button>

                  <div className="pt-1 flex justify-center">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-xs sm:text-sm text-white/50 hover:text-white/80 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      Use SSO login
                    </button>
                  </div>
                </form>

                {footerLinks}
              </div>
            )}

            {authStep === "phone" && (
              <div>
                <div className="mb-4 flex flex-col items-center text-center">
                  {spinningQ}
                  {heading}
                </div>

                <p className="mb-3 text-center text-sm sm:text-base font-medium text-white/85">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthStep("signin")}
                    className="underline underline-offset-4 hover:text-brandGreen transition-colors"
                  >
                    Sign in
                  </button>
                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await onPhoneContinue({
                      name,
                      dialCode: selectedCountry?.dialCode || "",
                      phone,
                    });
                  }}
                  className="space-y-3"
                >
                  <div className="h-11 rounded-full border border-white/15 bg-brandSurfaceAccent px-4 flex items-center gap-3">
                    <UserRound className="h-5 w-5 text-white/45" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-transparent text-sm sm:text-base placeholder:text-white/40 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="h-11 rounded-full border border-white/15 bg-brandSurfaceAccent px-3 sm:px-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCountryDropdownOpen((value) => !value)}
                        className="flex items-center gap-2 pr-3 border-r border-white/15 text-sm"
                      >
                        <span className="text-lg">{selectedCountry?.flag}</span>
                        <span className="text-sm">{selectedCountry?.dialCode}</span>
                        <ChevronDown className="h-4 w-4 text-white/45" />
                      </button>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter mobile number"
                        className="min-w-0 flex-1 bg-transparent text-sm sm:text-base placeholder:text-white/40 outline-none"
                      />
                    </div>

                    {countryDropdownOpen && (
                      <div className="rounded-2xl border border-white/15 bg-brandSurfaceAccent p-2">
                        <div className="mb-2 h-10 rounded-full border border-white/10 px-3 flex items-center gap-2">
                          <Search className="h-4 w-4 text-white/45" />
                          <input
                            value={countryQuery}
                            onChange={(e) => setCountryQuery(e.target.value)}
                            placeholder="Search your country"
                            className="w-full bg-transparent text-sm placeholder:text-white/40 outline-none"
                          />
                        </div>

                        <div className="max-h-52 overflow-y-auto pr-1">
                          {filteredCountries.map((country) => {
                            const isSelected = country.code === selectedCountry?.code;
                            return (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountryCode(country.code);
                                  setCountryDropdownOpen(false);
                                  setCountryQuery("");
                                }}
                                className={`w-full rounded-xl px-3 py-2 flex items-center justify-between text-left transition ${
                                  isSelected ? "bg-brandGreen/20 text-brandGreen" : "hover:bg-white/5"
                                }`}
                              >
                                <span className="flex items-center gap-2 text-sm">
                                  <span>{country.flag}</span>
                                  <span>{country.name} ({country.dialCode})</span>
                                </span>
                                {isSelected && <Check className="h-4 w-4" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep("options");
                        setCountryDropdownOpen(false);
                      }}
                      className="h-11 w-11 shrink-0 rounded-full bg-brandSurfaceAccent border border-white/10 text-white flex items-center justify-center"
                      aria-label="Go back"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="submit"
                      className="h-11 flex-1 rounded-full bg-white text-[#151515] text-sm sm:text-base font-semibold tracking-tight flex items-center justify-center gap-2"
                    >
                      Get code <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                {footerLinks}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
