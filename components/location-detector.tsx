"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LocationDetector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Se já existem parâmetros de busca, não faz nada
    if (searchParams.has("city") || (searchParams.has("lat") && searchParams.has("lon"))) {
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          router.push(`/?lat=${lat}&lon=${lon}`);
        },
        (error) => {
          console.warn("Geolocation denied or failed:", error);
          // Se falhar ou for negado, o padrão já é São Paulo no page.tsx
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 3600000 }
      );
    }
  }, [router, searchParams]);

  return null; // Componente invisível
}
