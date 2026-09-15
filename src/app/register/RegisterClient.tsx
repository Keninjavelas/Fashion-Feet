"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { registerUser } from "./actions";

export function RegisterClient() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{name?: string, email?: string, password?: string}>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const errors: {name?: string, email?: string, password?: string} = {};
    let isValid = true;

    if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
      isValid = false;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
      isValid = false;
    }
    
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
      
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/profile",
      });

      if (!res?.error) {
        router.push("/profile");
      } else {
        setError("Account created, but automatic sign in failed. Please login manually.");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-[var(--color-brand-50)]">
      <div className="w-full max-w-md bg-white p-8 shadow-2xl shadow-black/5 rounded-2xl">
        <h1 className="font-serif text-3xl text-[var(--color-brand-900)] text-center mb-8 font-bold">Create an Account</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm border border-red-100 text-center rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="relative">
            <input 
              type="text" 
              id="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors({...fieldErrors, name: undefined});
              }}
              className={`block px-4 pb-2.5 pt-6 w-full text-base text-black bg-white border ${fieldErrors.name ? 'border-red-500' : 'border-black/20'} rounded-xl appearance-none focus:outline-none focus:border-[var(--color-brand-900)] peer transition-colors`}
              placeholder=" "
            />
            <label htmlFor="name" className={`absolute text-sm ${fieldErrors.name ? 'text-red-500' : 'text-gray-500'} duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-[var(--color-brand-900)] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 uppercase tracking-widest font-medium pointer-events-none bg-white pr-2`}>Full Name</label>
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{fieldErrors.name}</p>}
          </div>
          <div className="relative mt-8">
            <input 
              type="email" 
              id="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({...fieldErrors, email: undefined});
              }}
              className={`block px-4 pb-2.5 pt-6 w-full text-base text-black bg-white border ${fieldErrors.email ? 'border-red-500' : 'border-black/20'} rounded-xl appearance-none focus:outline-none focus:border-[var(--color-brand-900)] peer transition-colors`}
              placeholder=" "
            />
            <label htmlFor="email" className={`absolute text-sm ${fieldErrors.email ? 'text-red-500' : 'text-gray-500'} duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-[var(--color-brand-900)] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 uppercase tracking-widest font-medium pointer-events-none bg-white pr-2`}>Email Address</label>
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{fieldErrors.email}</p>}
          </div>
          <div className="relative mt-8 mb-6">
            <input 
              type={showPassword ? "text" : "password"} 
              id="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors({...fieldErrors, password: undefined});
              }}
              className={`block px-4 pb-2.5 pt-6 w-full text-base text-black bg-white border ${fieldErrors.password ? 'border-red-500' : 'border-black/20'} rounded-xl appearance-none focus:outline-none focus:border-[var(--color-brand-900)] peer transition-colors pr-12`}
              placeholder=" "
            />
            <label htmlFor="password" className={`absolute text-sm ${fieldErrors.password ? 'text-red-500' : 'text-gray-500'} duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-[var(--color-brand-900)] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 uppercase tracking-widest font-medium pointer-events-none bg-white pr-2`}>Password</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-brand-900)] transition-colors focus:outline-none z-20"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{fieldErrors.password}</p>}
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[var(--color-brand-900)] text-white font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-brand-900)] transition-all rounded-xl disabled:opacity-70 flex justify-center items-center shadow-lg"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-gray-500 border-t border-black/5 pt-6">
          Already have an account? <Link href="/login" className="text-[var(--color-brand-900)] font-bold hover:text-[var(--color-accent-gold)] transition-colors ml-1">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
