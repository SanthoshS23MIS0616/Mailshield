"""
features.py - Email Feature Extraction Engine
Extracts 20+ handcrafted features from email text for ML classification
"""
import re
import math
from urllib.parse import urlparse


# ─── FEATURE EXTRACTION ──────────────────────────────────────────────────────

PHISHING_KEYWORDS = [
    "urgent", "immediately", "verify", "suspended", "compromised",
    "winner", "congratulations", "claim", "expire", "action required",
    "unusual activity", "security alert", "update payment", "confirm identity",
    "click here", "act now", "limited time", "free gift", "you have been selected",
    "account locked", "validate", "unauthorized", "suspicious", "penalty",
    "password", "ssn", "social security", "bank account", "credit card",
    "wire transfer", "western union", "bitcoin", "cryptocurrency",
]

LEGIT_KEYWORDS = [
    "meeting", "agenda", "project", "team", "schedule", "update",
    "report", "feedback", "review", "discuss", "please find",
    "attached", "regards", "sincerely", "best wishes",
]

SUSPICIOUS_TLD = [
    ".xyz", ".tk", ".ru", ".cn", ".top", ".club", ".online",
    ".site", ".website", ".info", ".biz", ".net.ru", ".co.cc",
]

BRAND_SPOOFS = [
    "paypa1", "paypa-l", "amaz0n", "netfl1x", "go0gle",
    "app1e", "micros0ft", "bankofamerica", "wellsfarg0",
    "ebay-secure", "amazon-security", "paypal-update",
]


def extract_urls(text):
    """Extract all URLs from text"""
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    return re.findall(url_pattern, text, re.IGNORECASE)


def analyze_url(url):
    """Analyze a single URL for suspicious characteristics"""
    features = {
        "has_ip": bool(re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url)),
        "is_https": url.lower().startswith("https://"),
        "url_length": len(url),
        "num_dots": url.count("."),
        "num_hyphens": url.count("-"),
        "has_suspicious_tld": any(url.lower().endswith(tld) or tld in url.lower() for tld in SUSPICIOUS_TLD),
        "has_brand_spoof": any(spoof in url.lower() for spoof in BRAND_SPOOFS),
        "has_at_symbol": "@" in url,
        "num_subdomains": len(urlparse(url).netloc.split(".")) - 2,
        "has_port": ":" in urlparse(url).netloc,
        "has_query_params": "?" in url,
        "path_length": len(urlparse(url).path),
        "has_double_slash": "//" in urlparse(url).path,
        "has_hex_encoding": "%" in url,
    }
    return features


def compute_entropy(text):
    """Compute Shannon entropy of text (high entropy = more random/obfuscated)"""
    if not text:
        return 0
    freq = {}
    for c in text:
        freq[c] = freq.get(c, 0) + 1
    total = len(text)
    entropy = -sum((count / total) * math.log2(count / total) for count in freq.values())
    return round(entropy, 4)


def extract_features(subject: str, body: str) -> dict:
    """
    Main feature extraction function.
    Returns a dictionary of 25+ features for ML classification.
    """
    full_text = f"{subject} {body}".lower()
    urls = extract_urls(full_text)

    # ── URL-based features ──────────────────────────────────────────
    num_urls = len(urls)
    url_analyses = [analyze_url(u) for u in urls]

    has_suspicious_url = any(a["has_suspicious_tld"] or a["has_brand_spoof"] or a["has_ip"] for a in url_analyses)
    has_http_url = any(not a["is_https"] for a in url_analyses)
    avg_url_length = sum(a["url_length"] for a in url_analyses) / max(num_urls, 1)
    max_url_dots = max((a["num_dots"] for a in url_analyses), default=0)
    has_ip_url = any(a["has_ip"] for a in url_analyses)
    has_brand_spoof_url = any(a["has_brand_spoof"] for a in url_analyses)
    has_at_in_url = any(a["has_at_symbol"] for a in url_analyses)
    has_hex_encoded_url = any(a["has_hex_encoding"] for a in url_analyses)

    # ── Text-based features ─────────────────────────────────────────
    phishing_keyword_count = sum(1 for kw in PHISHING_KEYWORDS if kw in full_text)
    legit_keyword_count = sum(1 for kw in LEGIT_KEYWORDS if kw in full_text)

    # Exclamation marks (urgency signals)
    exclamation_count = full_text.count("!")
    all_caps_words = len(re.findall(r'\b[A-Z]{3,}\b', f"{subject} {body}"))

    # Subject-specific signals
    subject_lower = subject.lower()
    subject_has_urgency = any(w in subject_lower for w in ["urgent", "immediately", "alert", "warning", "final", "action required"])
    subject_has_prize = any(w in subject_lower for w in ["congratulations", "winner", "prize", "reward", "selected"])
    subject_length = len(subject)

    # Body statistics
    body_length = len(body)
    word_count = len(body.split())
    avg_word_length = sum(len(w) for w in body.split()) / max(word_count, 1)
    text_entropy = compute_entropy(body[:500])  # First 500 chars

    # HTML/Link patterns
    has_html_links = bool(re.search(r'<a\s+href', body, re.IGNORECASE))
    has_form = bool(re.search(r'<form', body, re.IGNORECASE))
    has_password_field = bool(re.search(r'password|passwd|pwd', full_text))
    has_financial_info_request = bool(re.search(
        r'credit card|bank account|social security|ssn|pin number|cvv', full_text
    ))
    has_personal_info_request = bool(re.search(
        r'date of birth|mother.s maiden|confirm your|verify your identity', full_text
    ))

    # Sender/reply-to anomalies (simulated from body patterns)
    has_deadline = bool(re.search(r'\d+\s*(hours?|minutes?|days?)', full_text))
    threats_present = bool(re.search(
        r'(legal action|collection agency|account (will be|is) (closed|terminated|suspended)|penalty)', full_text
    ))

    return {
        # URL features
        "num_urls": num_urls,
        "has_suspicious_url": int(has_suspicious_url),
        "has_http_url": int(has_http_url),
        "avg_url_length": round(avg_url_length, 2),
        "max_url_dots": max_url_dots,
        "has_ip_url": int(has_ip_url),
        "has_brand_spoof_url": int(has_brand_spoof_url),
        "has_at_in_url": int(has_at_in_url),
        "has_hex_encoded_url": int(has_hex_encoded_url),
        # Keyword features
        "phishing_keyword_count": phishing_keyword_count,
        "legit_keyword_count": legit_keyword_count,
        "keyword_ratio": round(phishing_keyword_count / max(legit_keyword_count + 1, 1), 4),
        # Urgency/pressure features
        "exclamation_count": exclamation_count,
        "all_caps_words": all_caps_words,
        "has_deadline": int(has_deadline),
        "threats_present": int(threats_present),
        # Subject features
        "subject_has_urgency": int(subject_has_urgency),
        "subject_has_prize": int(subject_has_prize),
        "subject_length": subject_length,
        # Body/text features
        "body_length": body_length,
        "word_count": word_count,
        "avg_word_length": round(avg_word_length, 4),
        "text_entropy": text_entropy,
        # Sensitive info request features
        "has_password_field": int(has_password_field),
        "has_financial_info_request": int(has_financial_info_request),
        "has_personal_info_request": int(has_personal_info_request),
        "has_html_links": int(has_html_links),
        "has_form": int(has_form),
    }


def get_feature_names():
    """Return ordered list of feature names"""
    dummy = extract_features("test", "test body")
    return list(dummy.keys())


def get_feature_explanation(features: dict) -> list:
    """Generate human-readable explanation of suspicious features"""
    explanations = []

    if features["has_suspicious_url"]:
        explanations.append({"type": "danger", "text": "Suspicious URL detected (unusual domain/TLD)", "icon": "🔗"})
    if features["has_brand_spoof_url"]:
        explanations.append({"type": "danger", "text": "Brand spoofing detected in URL", "icon": "⚠️"})
    if features["has_ip_url"]:
        explanations.append({"type": "danger", "text": "URL uses raw IP address instead of domain", "icon": "🌐"})
    if features["has_http_url"] and features["num_urls"] > 0:
        explanations.append({"type": "warning", "text": "Uses insecure HTTP link(s)", "icon": "🔓"})
    if features["phishing_keyword_count"] > 3:
        explanations.append({"type": "danger", "text": f"High phishing keyword density ({features['phishing_keyword_count']} keywords)", "icon": "🚨"})
    if features["exclamation_count"] > 3:
        explanations.append({"type": "warning", "text": f"Excessive urgency signals ({features['exclamation_count']} exclamation marks)", "icon": "❗"})
    if features["all_caps_words"] > 2:
        explanations.append({"type": "warning", "text": f"Multiple ALL-CAPS words found ({features['all_caps_words']})", "icon": "🔤"})
    if features["threats_present"]:
        explanations.append({"type": "danger", "text": "Contains threats (legal action, suspension, etc.)", "icon": "⚖️"})
    if features["has_financial_info_request"]:
        explanations.append({"type": "danger", "text": "Requests financial information (credit card, bank)", "icon": "💳"})
    if features["has_personal_info_request"]:
        explanations.append({"type": "danger", "text": "Requests sensitive personal information", "icon": "🪪"})
    if features["has_password_field"]:
        explanations.append({"type": "danger", "text": "Requests password or credentials", "icon": "🔑"})
    if features["subject_has_urgency"]:
        explanations.append({"type": "warning", "text": "Subject line conveys false urgency", "icon": "⏰"})
    if features["subject_has_prize"]:
        explanations.append({"type": "danger", "text": "Subject promises prize/reward (social engineering)", "icon": "🏆"})
    if features["has_deadline"]:
        explanations.append({"type": "warning", "text": "Artificial time pressure / deadline mentioned", "icon": "⏳"})
    if features["has_at_in_url"]:
        explanations.append({"type": "danger", "text": "URL contains @ symbol (deception tactic)", "icon": "🎭"})
    if features["num_urls"] > 3:
        explanations.append({"type": "warning", "text": f"Unusually high number of URLs ({features['num_urls']})", "icon": "🔗"})

    if not explanations and features["legit_keyword_count"] > 2:
        explanations.append({"type": "safe", "text": "Contains legitimate communication patterns", "icon": "✅"})
        explanations.append({"type": "safe", "text": "No suspicious URLs or keywords detected", "icon": "🛡️"})

    return explanations
