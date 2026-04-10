const configText = `{
  apiKey: "AIzaSyC9...",
  authDomain: "app...",
  projectId: "app...",
  storageBucket: "app...",
  messagingSenderId: "123",
  appId: "1:23..."
}`;

try {
  let cleanText = configText.match(/\{[\s\S]*\}/)[0];
  console.log("1. Extracted:", cleanText);
  // Tambahkan tanda kutip ganda ke Key yang belum dikuotasi
  cleanText = cleanText.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
  console.log("2. After Key Quotes:", cleanText);
  // Ganti kutipan tunggal (single quote) ke double quote
  cleanText = cleanText.replace(/'/g, '"');
  console.log("3. After Double Quotes:", cleanText);
  // Buang tanda koma gantung di ujung (trailing comma) yang merusak JSON
  cleanText = cleanText.replace(/,\s*\}/g, '}');
  console.log("4. Final Clean Text:", cleanText);

  // Try parsing
  const parsed = JSON.parse(cleanText);
  console.log("Parsed OK!", Object.keys(parsed));
} catch(e) {
  console.error("FAIL:", e);
}
