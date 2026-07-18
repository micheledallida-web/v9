import { useState } from "react";
import { X, Mail, SmartPhone } from "lucide-react";
import { AuthButton, Q3DCanvas } from "./components-or-wherever-your-handlers-live"; 
// Note: Ensure Q3DCanvas and AuthButton components from your previous file are available to import!

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthenticModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Container matching the clean glass structure from the graphic */}
      <div className="bg-[#0c0c0c] w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-8 relative border border-white/10 shadow-2xl overflow-y-auto max-h-[95vh]">
        
        {/* Close Button Cross */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-zinc-500 hover:text-white transition-colors p-1"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 1. Live 3D Spinning Q Logo Canvas Section */}
        <div className="w-full flex justify-center mb-4 mt-4">
          <div className="w-24 h-24 relative flex items-center justify-center">
            <Q3DCanvas scale={1.2} className="w-full h-full absolute pointer-events-none" />
          </div>
        </div>

        {/* 2. Headline Core */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Build Full-Stack <br />
            <span className="text-[#8EF08A]">Web & Mobile Apps</span> in minutes
          </h2>
        </div>

        {/* 3. Primary Google Button Block */}
        <div className="space-y-4">
          <AuthButton
            provider="Google"
            className="w-full inline-flex items-center justify-center gap-3 bg-white text-black py-3.5 px-6 rounded-full text-base font-semibold transition-all hover:bg-zinc-200 active:scale-[0.99] shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.81-6.277-6.277 0-3.466 2.81-6.277 6.277-6.277 1.493 0 2.86.52 3.938 1.387l3.076-3.077C18.99 1.94 15.82 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.842 0 10.94-4.143 10.94-11.24 0-.668-.063-1.353-.186-1.955H12.24z"/>
            </svg>
            <span>Continue with Google</span>
          </AuthButton>

          {/* 4. Horizontal Quick OAuth Grid (GitHub, Apple, Facebook) */}
          <div className="grid grid-cols-3 gap-3">
            <AuthButton
              provider="GitHub"
              className="inline-flex items-center justify-center py-3.5 bg-zinc-900 border border-white/10 rounded-full hover:bg-zinc-800 transition-all text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.0.069-.608.009 1.002.454 1.53 1.53 1.53.892 0 1.534-.639 1.534-1.53 0-.25-.05-.49-.13-.71-.4-.11-.73-.32-1-.62zm3.17-4.12c.1-.23.13-.49.13-.76 0-.89-.64-1.53-1.53-1.53-.27 0-.53.04-.76.12-.12-.4-.33-.74-.63-1.01V6h3.79c.25 0 .49.05.71.13.4.11.73.32 1 .62.29.3.49.66.58 1.07l.01.18V12c0 .89-.64 1.53-1.53 1.53z" />
              </svg>
            </AuthButton>

            <AuthButton
              provider="Apple"
              className="inline-flex items-center justify-center py-3.5 bg-zinc-900 border border-white/10 rounded-full hover:bg-zinc-800 transition-all text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94 1.07.08 2.15-.52 2.81-1.33z" />
              </svg>
            </AuthButton>

            <AuthButton
              provider="Facebook"
              className="inline-flex items-center justify-center py-3.5 bg-zinc-900 border border-white/10 rounded-full hover:bg-zinc-800 transition-all text-white"
            >
              <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
              </svg>
            </AuthButton>
          </div>

          {/* Divider Text */}
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold tracking-widest text-zinc-600 py-2">
            <div className="h-[1px] bg-white/5 flex-1" />
            <span>OR</span>
            <div className="h-[1px] bg-white/5 flex-1" />
          </div>

          {/* 5. Fallback Methods */}
          <button className="w-full inline-flex items-center justify-center gap-3 bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 py-3.5 px-6 rounded-full text-sm font-medium transition-all text-zinc-300">
            <Mail className="w-4 h-4 text-zinc-500" />
            <span>Continue with Email</span>
          </button>

          <button className="w-full inline-flex items-center justify-center gap-3 bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 py-3.5 px-6 rounded-full text-sm font-medium transition-all text-zinc-300">
            <SmartPhone className="w-4 h-4 text-zinc-500" />
            <span>Continue with Phone</span>
          </button>
        </div>

        {/* 6. Tiny Legal Disclaimers */}
        <p className="mt-8 text-center text-xs text-zinc-600 leading-normal px-4">
          By continuing, you agree to our <br />
          <a href="#" className="underline text-zinc-400 hover:text-white">Terms of Service</a> and{" "}
          <a href="#" className="underline text-zinc-400 hover:text-white">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
