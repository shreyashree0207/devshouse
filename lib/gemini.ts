const KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`;

export async function generateImpactMessage(amount: number, category: string, ngoName: string) {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Donor gave ₹${amount} to "${ngoName}" working in ${category}. 
             Write ONE specific emotional sentence about their impact with real numbers. 
             Example: "Your ₹500 will provide textbooks to 8 children for a full school year."
             Only return the sentence, nothing else.`
          }]
        }]
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Gemini impact error:', error);
    return `Your ₹${amount} donation will directly impact lives through ${ngoName}.`;
  }
}

export async function verifyProofImage(base64: string, description: string) {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: 'image/jpeg', data: base64 } },
            {
              text: `Verify this NGO proof image for project: "${description}". 
              Analyze the image for authenticity relative to the description.
              Return ONLY valid JSON in this format: 
              {"score": <number 0-100>, "verdict": <string explanation>, "tags": [<array of strings>], "authentic": <boolean>}`
            }
          ]
        }]
      })
    });
    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0) throw new Error("No candidates returned from Gemini");
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (error) {
    console.error('Gemini verification error:', error);
    return { 
      score: 70, 
      verdict: "Verification process completed with limited AI confidence. Human audit recommended.", 
      tags: ["Pending Review"], 
      authentic: false 
    };
  }
}
