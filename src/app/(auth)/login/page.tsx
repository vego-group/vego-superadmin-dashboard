// src/app/(auth)/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Header for mobile - يظهر فقط في الموبايل */}
      <div className="md:hidden w-full bg-myvego-gradient-vertical text-white py-8 px-4 text-center relative overflow-hidden">
        {/* Decorative circles للخلفية في الموبايل */}
        <div className="absolute top-0 left-0 w-48 h-48 border border-white/10 rounded-full translate-x-[-30%] translate-y-[-30%]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 border border-white/5 rounded-full translate-x-[30%] translate-y-[30%]" />
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-wide mb-2">
            My<span className="font-light">Vego</span>
          </h1>
          <p className="text-sm opacity-90 max-w-xs mx-auto">
            Smart Mobility Management System
          </p>
        </div>
      </div>

      {/* Left Side - يختبئ في الموبايل ويظهر في الديسكتوب */}
      <div className="hidden md:flex w-1/2 bg-myvego-gradient-vertical text-white items-center justify-center relative overflow-hidden">
        <div className="text-center space-y-4 z-10">
          <h1 className="text-5xl font-bold tracking-wide">
            My<span className="font-light">Vego</span>
          </h1>
          <p className="text-lg opacity-80">
            Smart Mobility Management System
          </p>
        </div>

        {/* Decorative circles للديسكتوب */}
        <div className="absolute bottom-0 left-0 w-72 h-72 border border-white/20 rounded-full translate-x-[-30%] translate-y-[30%]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 border border-white/10 rounded-full translate-x-[-20%] translate-y-[40%]" />
        <div className="absolute top-0 right-0 w-48 h-48 border border-white/5 rounded-full translate-x-[30%] translate-y-[-30%]" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full md:w-1/2 bg-gray-50 items-center justify-center p-6 min-h-[calc(100vh-120px)] md:min-h-screen">
        <div className="w-full max-w-sm">
         
          
          <LoginForm />
          
          {/* Additional links للموبايل */}
          <div className="mt-6 text-center md:hidden">
            <p className="text-xs text-gray-400">
              By signing in, you agree to our Terms and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Footer للموبايل */}
      <div className="md:hidden w-full bg-gray-50 py-4 px-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-400">
          © 2024 MyVego. All rights reserved.
        </p>
      </div>
    </div>
  );
}