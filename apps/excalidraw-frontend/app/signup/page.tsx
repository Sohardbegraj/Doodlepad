"use client"; // if using App Router
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { CardSpotlight } from "@/components/ui/card-spotlight";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({name:"", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch(`http://localhost:5050/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/signin"); // or redirect to dashboard
      alert(form)
    } else {
      setError(data.message || "Signup failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#171718]">
          <CardSpotlight>
          <form
            onSubmit={handleSubmit}
            className=" p-8 rounded-xl shadow-md space-y-4 w-full max-w-md gap-y-4"
          >
            <h1 className="text-2xl font-bold text-center text-white mb-4 relative z-20">Sign Up</h1>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <input
              name="name"
              type="text"
              placeholder="username"
              className="w-full relative z-20 p-2 border rounded-2xl bg-white text-gray-900 text-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-300"
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="text"
              placeholder="Email"
              className="w-full relative z-20 p-2 border rounded-2xl bg-white text-gray-900 text-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-300"
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full p-2 relative z-20 border rounded-2xl bg-white text-gray-900 text-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-300"
              onChange={handleChange}
              required
            />
            <Button type="submit" value="signup"/>
            
          </form>
          <p className="text-white relative z-20 text-center">Already have an account? <button onClick={()=>{
            router.push("/signin")
          }}>
            Sign In</button></p>
          </CardSpotlight>
        </div>
  );
}
