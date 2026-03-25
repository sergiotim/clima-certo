// Mocking the environment and logic of index.ts to verify grouping and flow
const mockSubscribers = [
  { email: "user1@example.com", city: "São Paulo", id: "uuid1" },
  { email: "user2@example.com", city: "São Paulo", id: "uuid2" },
  { email: "user3@example.com", city: "Rio de Janeiro", id: "uuid3" },
  { email: "user4@example.com", city: "Curitiba", id: "uuid4" },
  { email: "user5@example.com", city: "Rio de Janeiro", id: "uuid5" },
];

console.log("--- Testing Grouping Logic ---");
const subscribersByCity: Record<string, any[]> = {};
mockSubscribers.forEach(sub => {
  const city = sub.city || "São Paulo";
  if (!subscribersByCity[city]) subscribersByCity[city] = [];
  subscribersByCity[city].push(sub);
});

for (const [city, citySubscribers] of Object.entries(subscribersByCity)) {
  console.log(`City: ${city}, Subscribers: ${citySubscribers.length}`);
  citySubscribers.forEach(s => console.log(`  - ${s.email}`));
}

console.log("\n--- Simulating Function Execution ---");
async function simulate() {
  const results = [];
  for (const [city, citySubscribers] of Object.entries(subscribersByCity)) {
    console.log(`\n[Weather] Fetching for ${city}... (Once)`);
    console.log(`[AI] Generating message for ${city}... (Once)`);
    
    for (const subscriber of citySubscribers) {
      console.log(`[Brevo] Sending email to ${subscriber.email} with city context: ${city}`);
      results.push({ email: subscriber.email, status: "success" });
    }
  }
  console.log("\nFinal Results count:", results.length);
}

simulate();
