const configText = `
{
  apiKey: "AIzaSyC9...",
  authDomain: "app-...",
  projectId: "app-...",
  storageBucket: "...",
  messagingSenderId: "48...",
  appId: "1:48..."
}`;
try {
  const match = configText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No match");
  console.log("Matched:", match[0]);
  const configObj = (new Function('return ' + match[0]))();
  console.log("Parsed keys:", Object.keys(configObj));
  
  if (!configObj || !configObj.apiKey || !configObj.projectId) {
      throw new Error("Missing fields");
  }
  console.log("Success!");
} catch(e) {
  console.error("Error:", e);
}
