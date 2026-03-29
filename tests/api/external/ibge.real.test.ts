describe("IBGE real API smoke", () => {
  it("returns list of states", async () => {
    const response = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    );

    expect(response.ok).toBe(true);

    const data = (await response.json()) as Array<{
      id: number;
      nome: string;
      sigla: string;
    }>;

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(typeof data[0]?.id).toBe("number");
    expect(typeof data[0]?.sigla).toBe("string");
  });

  it("returns list of cities for Sao Paulo state", async () => {
    const response = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados/35/municipios?orderBy=nome"
    );

    expect(response.ok).toBe(true);

    const data = (await response.json()) as Array<{ id: number; nome: string }>;

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(typeof data[0]?.id).toBe("number");
    expect(typeof data[0]?.nome).toBe("string");
  });
});
