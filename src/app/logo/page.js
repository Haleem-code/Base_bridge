"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";


const LogoPage = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/landing");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="flex justify-center items-center h-screen bg-blue-600"
      
    >
      <Image 
        src="/images/logo.svg"
        alt="Logo"
        width={35} 
        height={35}
      />
      <span className="text-white">BaseBridge</span>
    </div>
  );
};

export default LogoPage;
