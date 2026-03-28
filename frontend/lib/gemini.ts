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
// Master proof verification function — runs all 4 checks
export async function verifyProofSubmission({
  afterImageBase64,
  beforeImageBase64,
  activityDescription,
  ngoDistrict,
  submittedLat,
  submittedLng,
  ngoLat,
  ngoLng
}: {
  afterImageBase64: string;
  beforeImageBase64?: string;
  activityDescription: string;
  ngoDistrict: string;
  submittedLat: number;
  submittedLng: number;
  ngoLat: number;
  ngoLng: number;
}) {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: 'image/jpeg', data: afterImageBase64 } },
            ...(beforeImageBase64 ? [
              { inline_data: { mime_type: 'image/jpeg', data: beforeImageBase64 } }
            ] : []),
            { text: `You are a fraud detection AI for an NGO transparency platform.

Activity description: "${activityDescription}"
NGO district: ${ngoDistrict}
Photo GPS coordinates: ${submittedLat}, ${submittedLng}
NGO registered coordinates: ${ngoLat}, ${ngoLng}

Analyze ${beforeImageBase64 ? 'both images (before = second image, after = first image)' : 'this proof image'} and return ONLY this exact JSON:
{
  "reverse_image_score": <0-100, how original/unmanipulated is the after photo>,
  "geotag_match_score": <0-100, does GPS location make sense for this NGO's district>,
  "content_match_score": <0-100, does the image actually show the described activity>,
  "before_after_score": <0-100, is there visible real-world progress from before to after, or 50 if no before image>,
  "overall_trust_score": <weighted average: reverse*0.35 + geotag*0.25 + content*0.25 + before_after*0.15>,
  "verdict": "<2 sentence honest assessment>",
  "tags": ["<what is visible in image>"],
  "spoofing_flags": ["<list any red flags, empty array if none>"],
  "authentic": <true if overall_trust_score >= 70>
}

Red flags to detect:
- Stock photo characteristics (too perfect, watermark artifacts)
- GPS coordinates far from NGO's registered district
- Image content unrelated to stated activity
- Signs of digital manipulation
- Indoor photo for claimed outdoor activity
- No human presence for a people-focused activity`
            }
          ]
        }]
      })
    });

    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text.replace(/```json|```/g, '').trim());

  } catch (error) {
    console.error('Proof submission verification failed:', error);
    return {
      reverse_image_score: 50, geotag_match_score: 50,
      content_match_score: 50, before_after_score: 50,
      overall_trust_score: 50,
      verdict: "Verification temporarily unavailable.",
      tags: [], spoofing_flags: [], authentic: false
    };
  }
}

// Generate donor notification message after proof verified
export async function generateProofNotification(donorName: string, amount: number, activityTitle: string, ngoName: string, trustScore: number) {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text:
          `Write a warm 2-sentence notification to ${donorName} telling them their ₹${amount} 
           donation to "${activityTitle}" by ${ngoName} has been verified with photo proof 
           (trust score: ${trustScore}/100). Make it personal and specific to the activity.
           Return ONLY the message.`
        }]}]
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Notification generation failed:', error);
    return `Your ₹${amount} donation to "${activityTitle}" has been verified with photo proof by our AI. Thank you for making a real difference!`;
  }
}
