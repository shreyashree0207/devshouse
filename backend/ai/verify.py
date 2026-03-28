import os, requests

def verify_image(image_url: str, project_description: str):
    key = os.getenv("GOOGLE_VISION_KEY")
    resp = requests.post(
        f"https://vision.googleapis.com/v1/images:annotate?key={key}",
        json={"requests":[{"image":{"source":{"imageUri":image_url}},
            "features":[
                {"type":"LABEL_DETECTION","maxResults":10},
                {"type":"SAFE_SEARCH_DETECTION"},
                {"type":"WEB_DETECTION","maxResults":5}
            ]}]}
    )
    data = resp.json()["responses"][0]
    safe = data.get("safeSearchAnnotation",{})
    if safe.get("adult") in ["LIKELY","VERY_LIKELY"]:
        return {"score":0,"verdict":"Image flagged unsafe.","labels":[],"flags":["unsafe"],"web_matches":0}

    labels = [l["description"].lower() for l in data.get("labelAnnotations",[])]
    keywords = project_description.lower().split()
    matches = sum(1 for k in keywords if any(k in l for l in labels))
    relevance = int((matches / max(len(keywords),1)) * 40)

    web = data.get("webDetection",{})
    full_matches = len(web.get("fullMatchingImages",[]))
    partial_matches = len(web.get("partialMatchingImages",[]))
    web_count = full_matches + partial_matches

    flags = []
    penalty = 0
    if full_matches >= 3:
        flags.append("image_found_online"); penalty = 40
    elif full_matches >= 1:
        flags.append("possible_reuse"); penalty = 20

    score = max(0, min(100, 40 + relevance - penalty))

    if "image_found_online" in flags:
        verdict = f"⚠️ Image found {web_count} times online — likely recycled content."
    elif "possible_reuse" in flags:
        verdict = f"Image found elsewhere online. Detected: {', '.join(labels[:3])}."
    else:
        verdict = f"✅ No prior web matches. Detected: {', '.join(labels[:3])}. Score: {score}/100."

    return {"score":score,"verdict":verdict,"labels":labels,"flags":flags,"web_matches":web_count}