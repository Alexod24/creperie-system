import { supabase } from "../src/lib/supabaseClient";

async function debugSales() {
  console.log("--- Debugging Sales Query ---");
  const { data, error, status, statusText } = await supabase
    .from("sales")
    .select(`
      *,
      users ( full_name )
    `)
    .limit(1);

  if (error) {
    console.error("Error detected:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("Details:", error.details);
    console.error("Hint:", error.hint);
  } else {
    console.log("Success! Data sample:", data);
  }
  console.log("Status:", status, statusText);
}

debugSales();
