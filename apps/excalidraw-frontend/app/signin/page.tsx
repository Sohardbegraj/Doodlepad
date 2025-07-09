"use client"; // if using App Router
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { signIn } from "next-auth/react";
import { IconBrandGithub, IconBrandGoogle, IconGitFork } from "@tabler/icons-react";


export default function SigninPage() {
  const router = useRouter();
  const [email,setemail]=useState("");
  const [password,setpassword]=useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res =await signIn("credentials",{
      email,
      password,
      redirect:false
    })
    if(res?.error){
      setError(res.error);
    }else{
      router.push("/dashboard")
    }

  }

  return (
    
    <div className="flex justify-center items-center h-screen bg-[#171718]">
      <CardSpotlight>
        <div className="bg-white absolute top-0 right-0 p-2 rounded-xl">
          <button 
          onClick={()=>{
            setemail("sohard")
            setpassword("1234567")
          }}>
            Dummy credentials
          </button>
        </div>
      <form
        onSubmit={handleSubmit}
        className=" p-8 rounded-xl shadow-md space-y-4 w-full max-w-md gap-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-white mb-4 relative z-20">Sign In</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <input
          name="email"
          type="text"
          placeholder="Email"
          className="w-full relative z-20 p-2 border rounded-2xl bg-white text-gray-900 text-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-300"
          value={email}
          required
          onChange={(e)=>setemail(e.target.value)}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-2 relative z-20 border rounded-2xl bg-white text-gray-900 text-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-300"
          value={password}
          required
          onChange={(e)=>setpassword(e.target.value)}
        />
        <Button type="submit" value="signin"/>
        </form>
        <hr className="bg-gray-200 mb-6 relative z-20" />
        <button onClick={()=>signIn("google")}
        className="bg-white mb-6 text-black relative z-20 w-full h-16 rounded-xl outline-4 outline-blue-200 font-bold text-xl hover:bg-blue-500/50 hover:text-white flex justify-center items-center"
        ><IconBrandGoogle/>oogle
        </button>
        <button onClick={()=>signIn("github")}
        className="text-white mb-6 bg-black relative z-20 w-full h-16 rounded-xl outline-4 outline-blue-200 font-bold text-xl hover:bg-blue-500/50 hover:text-white flex justify-center items-center"
        > Github<IconBrandGithub/>
        </button>

      
      <p className="text-white relative z-20 text-center">Don't have an account? <button onClick={()=>{
        router.push("/signup")
        console.log("clicked")
      }}>
        Sign up</button></p>
        
      </CardSpotlight>
    </div>
   
  );
}
