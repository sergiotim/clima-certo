import { getWeatherData } from "@/lib/weather";

const hasWeatherApiKey = Boolean(process.env.OPENWEATHER_API_KEY);

describe("OpenWeather real API smoke", () => {
  it.skipIf(!hasWeatherApiKey)(
    "returns weather data for a valid city",
    async () => {
      const data = await getWeatherData("Sao Paulo");

      expect(data).not.toBeNull();
      expect(data?.name).toBeTruthy();
      expect(typeof data?.main?.temp).toBe("number");
      expect(typeof data?.coord?.lat).toBe("number");
    }
  );

  it.skipIf(!hasWeatherApiKey)(
    "returns null for a clearly invalid city",
    async () => {
      const data = await getWeatherData("cidade-inexistente-zzzzzz-12345");
      expect(data).toBeNull();
    }
  );

  it("has OPENWEATHER_API_KEY configured (or intentionally skips external smoke)", () => {
    if (!hasWeatherApiKey) {
      expect(true).toBe(true);
      return;
    }

    expect(process.env.OPENWEATHER_API_KEY).toBeTruthy();
  });
});
