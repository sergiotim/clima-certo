"use client";

import { useState, useEffect } from "react";

interface State {
  id: number;
  sigla: string;
  nome: string;
}

interface City {
  id: number;
  nome: string;
}

export function useIBGEData(country: string) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    if (country === "BR") {
      fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
        .then((res) => res.json())
        .then((data) => setStates(data))
        .catch((err) => console.error("Error fetching states:", err));
    } else {
      setStates([]);
      setCities([]);
      setSelectedState("");
    }
  }, [country]);

  useEffect(() => {
    if (country === "BR" && selectedState) {
      setIsLoadingCities(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`)
        .then((res) => res.json())
        .then((data) => {
          setCities(data);
          setIsLoadingCities(false);
        })
        .catch((err) => {
          console.error("Error fetching cities:", err);
          setIsLoadingCities(false);
        });
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedState, country]);

  return {
    states,
    cities,
    selectedState,
    setSelectedState,
    selectedCity,
    setSelectedCity,
    isLoadingCities,
  };
}
