"use client";

import { LoginScreen } from "@/components/login_screen";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  router.push("/login");
  
  return (
    <div>
    </div>
  );
}
