"use client";

import { LoginScreen } from "@/components/login_screen";
import { stat } from "fs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const checkConnection = async () => {
    try {
        const response = await fetch("http://localhost:5001/status");
        if (!response.ok) {
            console.error("Server responded with an error:", response.status);
            return false;
        }
        return true;

    } catch (error) {
        console.error("Error during connection check:", error);
        return false;
    }
};

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const runCheck = async () => {
            const status = await checkConnection();
            if (status === true) {
                console.log("Redirecting to /login");
                router.push("/login");
            }
        };

        runCheck();

    }, [router]);

    return (
        <div>Checking connection...</div>
    );
}
