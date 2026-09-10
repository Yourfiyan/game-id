#!/usr/bin/env python3
"""
Epic Games Account Export Importer / Parser

Extracts and structures account-level data and game ownership metadata from
Epic Games data exports (ZIP files or extracted folders).

Extracts:
  - Account Profile: ID, Display Name, Real Name, Email, Country, Created Date, Status, Address, Language
  - Connected Accounts (External Auths): GitHub, Google, Ubisoft, Steam, Xbox, PlayStation, etc.
  - Consented 3rd Party Games & Apps: Title, Organization (Publisher), Scopes, Dates, Support Links
  - Entitlements: Entitlement ID, Product/Audience Name, Grant Date, Use Counts
  - Social Profile & Friends: Friend counts, request status, visibility settings
  - Communication Methods: Verified phone/SMS, email, communication preferences
  - Agreements: EULAs, Store policies, Acceptance dates

Compatible with Game ID data pipeline and runtime schema:
  - Preserves exact strings and dates without fabrication
  - Emits structured JSON for account metadata and game catalogs
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
import zipfile
from pathlib import Path
from typing import Any, Dict, List, Optional

# Use pypdfium2 if available, fall back to pypdf
try:
    import pypdfium2 as pdfium
    HAVE_PDFIUM = True
except ImportError:
    HAVE_PDFIUM = False

try:
    from pypdf import PdfReader
    HAVE_PYPDF = True
except ImportError:
    HAVE_PYPDF = False


def extract_text_from_pdf(pdf_path: str | Path) -> str:
    """Extract full plain text from a PDF file using the best available engine."""
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        return ""

    if HAVE_PDFIUM:
        doc = None
        try:
            doc = pdfium.PdfDocument(str(pdf_path))
            pages_text = []
            for i in range(len(doc)):
                page = doc[i]
                textpage = page.get_textpage()
                pages_text.append(textpage.get_text_range())
                textpage.close()
                page.close()
            return "\n".join(pages_text)
        except Exception as err:
            print(f"[Warning] pypdfium2 failed on {pdf_path.name}: {err}. Trying pypdf...", file=sys.stderr)
        finally:
            if doc is not None:
                doc.close()

    if HAVE_PYPDF:
        try:
            reader = PdfReader(str(pdf_path))
            pages_text = []
            for page in reader.pages:
                pages_text.append(page.extract_text() or "")
            return "\n".join(pages_text)
        except Exception as err:
            print(f"[Error] pypdf failed on {pdf_path.name}: {err}", file=sys.stderr)

    raise RuntimeError("No working PDF extraction library found (install pypdfium2 or pypdf).")


class EpicExportParser:
    """Parses an Epic Games GDPR / Account Data export bundle."""

    def __init__(self, root_dir: Path):
        self.root_dir = Path(root_dir)
        self.files_map: Dict[str, Path] = {}
        self._index_files()

    def _index_files(self) -> None:
        for root, _, files in os.walk(self.root_dir):
            for f in files:
                full_p = Path(root) / f
                rel_p = full_p.relative_to(self.root_dir).as_posix().lower()
                self.files_map[rel_p] = full_p
                # Also index by filename only
                if f.lower() not in self.files_map:
                    self.files_map[f.lower()] = full_p

    def find_file(self, *patterns: str) -> Optional[Path]:
        for pat in patterns:
            pat_low = pat.lower()
            for k, path in self.files_map.items():
                if pat_low in k:
                    return path
        return None

    def parse_main_account_pdf(self) -> Dict[str, Any]:
        """Extracts core account data, connected accounts, consented games, and entitlements."""
        main_pdf = self.find_file("epicgamesaccountdata.pdf", "legacy/")
        if not main_pdf:
            # Fallback to any pdf with "account" in name
            for k, path in self.files_map.items():
                if "account" in k and k.endswith(".pdf"):
                    main_pdf = path
                    break

        if not main_pdf:
            return {}

        text = extract_text_from_pdf(main_pdf)
        data: Dict[str, Any] = {
            "sourceFile": main_pdf.name,
            "accountDetails": self._parse_account_details(text),
            "connectedAccounts": self._parse_external_auths(text),
            "consentedApps": self._parse_consented_apps(text),
            "entitlements": self._parse_entitlements(text),
            "agreements": self._parse_agreements(text),
            "communicationMethods": self._parse_communication_methods(text),
            "accountHistory": self._parse_account_history(text),
            "sessions": self._parse_sessions(text),
        }
        return data

    def _parse_account_details(self, text: str) -> Dict[str, Any]:
        details: Dict[str, Any] = {}
        # 1. Account Details block
        match = re.search(r"Account Details\s*\n(.*?)(?=\nMore Account Info|\nAddresses)", text, re.DOTALL)
        if match:
            for line in match.group(1).splitlines():
                line = line.strip()
                if ":" in line:
                    k, v = line.split(":", 1)
                    val = v.strip()
                    details[self._camel_case(k.strip())] = None if val in ("[----]", "") else val

        # 2. More Account Info
        more_match = re.search(r"More Account Info\s*\n(.*?)(?=\nAddresses|\n3rd Party Apps)", text, re.DOTALL)
        if more_match:
            for line in more_match.group(1).splitlines():
                line = line.strip()
                if ":" in line:
                    k, v = line.split(":", 1)
                    val = v.strip()
                    details[self._camel_case(k.strip())] = None if val in ("[----]", "") else val

        # 3. Addresses
        addr_match = re.search(
            r"Addresses\s*\nName Postal Code Address line 1 Address line 2 City Country Region\s*\n(.*?)(?=\n3rd Party Apps|\nDevices|\nSessions)",
            text,
            re.DOTALL,
        )
        addresses: List[str] = []
        if addr_match:
            for line in addr_match.group(1).splitlines():
                line = line.strip()
                if line and not any(line.startswith(h) for h in ["3rd Party Apps", "Devices", "Sessions"]):
                    addresses.append(line)
        details["addresses"] = addresses
        return details

    def _parse_external_auths(self, text: str) -> List[Dict[str, Any]]:
        """Parse External Auths (Connected Accounts like GitHub, Google, Ubisoft, etc.)."""
        auths: List[Dict[str, Any]] = []
        match = re.search(
            r"External Auths\s*\nAuth Type External Auth ID External Display Name Added Date External Auths\s*\n(.*?)(?=\nPayment Profile|\nTransaction History|\nCode Redemptions|\nAccount History)",
            text,
            re.DOTALL,
        )
        if not match:
            return auths

        raw_auth = match.group(1).strip()
        lines = [l.strip() for l in raw_auth.splitlines() if l.strip()]

        known_auth_prefixes = (
            "github", "google", "ubisoft", "steam", "playstation", "psn",
            "xbox", "nintendo", "apple", "facebook", "twitch", "amazon", "discord"
        )
        merged_lines: List[str] = []
        for l in lines:
            if any(l.lower().startswith(p) for p in known_auth_prefixes):
                merged_lines.append(l)
            elif merged_lines:
                # If this continuation line starts with a trailing char of a broken token without space
                if re.match(r"^[0-9a-fA-F]\b", l) and "-" in merged_lines[-1]:
                    # Likely a broken UUID ending (e.g. ...3f9 on line 1, 1 on line 2)
                    first_tok, *rest_toks = l.split(None, 1)
                    # Append first_tok directly to the last token of previous line if it was an incomplete UUID
                    prev_tokens = merged_lines[-1].split()
                    if len(prev_tokens) >= 2 and len(prev_tokens[1]) in (35, 36) or "-" in prev_tokens[1]:
                        prev_tokens[1] += first_tok
                        merged_lines[-1] = " ".join(prev_tokens) + (" " + rest_toks[0] if rest_toks else "")
                    else:
                        merged_lines[-1] += " " + l
                else:
                    merged_lines[-1] += " " + l
            else:
                merged_lines.append(l)

        for l in merged_lines:
            parts = l.split()
            if len(parts) >= 3:
                auth_type = parts[0]
                tokens = parts[1:]
                if tokens and tokens[-1] == "[----]":
                    tokens = tokens[:-1]
                if not tokens:
                    continue
                added_date = tokens[-1] if re.match(r"\d{1,2}/\d{1,2}/\d{4}", tokens[-1]) else None
                if added_date:
                    tokens = tokens[:-1]
                auth_id = tokens[0] if tokens else None
                disp_name = " ".join(tokens[1:]) if len(tokens) > 1 else auth_id
                auths.append({
                    "authType": auth_type,
                    "externalAuthId": auth_id,
                    "externalDisplayName": disp_name,
                    "addedDate": added_date,
                })
        return auths

    def _parse_consented_apps(self, text: str) -> List[Dict[str, Any]]:
        """Parse 3rd party games and apps with granted permissions."""
        apps: List[Dict[str, Any]] = []
        match = re.search(
            r"3rd Party Apps with Consent to Collect Epic Data\s*\n(.*?)(?=\nDevices|\nSessions|\nExternal Auths)",
            text,
            re.DOTALL,
        )
        if not match:
            return apps

        raw_lines = match.group(1).split("\n")
        curr: Dict[str, Any] = {}

        for line in raw_lines:
            l = line.strip()
            if not l or l == "Consented Scopes:" or l == "No data.":
                continue
            if l.startswith("Created at:"):
                curr["createdAt"] = l.replace("Created at:", "").strip()
            elif l.startswith("Updated at:"):
                curr["updatedAt"] = l.replace("Updated at:", "").strip()
            elif l.startswith("Organization Name:"):
                curr["organization"] = l.replace("Organization Name:", "").strip()
            elif l.startswith("Privacy Policy:"):
                curr["privacyPolicy"] = l.replace("Privacy Policy:", "").strip()
            elif l.startswith("Support Email:"):
                curr["supportEmail"] = l.replace("Support Email:", "").strip()
            elif l.startswith("Consented Scopes:"):
                curr["consentedScopes"] = [s.strip() for s in l.replace("Consented Scopes:", "").split(",") if s.strip()]
            else:
                if "organization" in curr or "createdAt" in curr:
                    if "title" in curr and curr["title"]:
                        apps.append(curr)
                    curr = {"title": l}
                else:
                    if "title" in curr:
                        curr["title"] += " " + l
                    else:
                        curr = {"title": l}

        if "title" in curr and curr["title"]:
            apps.append(curr)

        return apps

    def _parse_entitlements(self, text: str) -> List[Dict[str, Any]]:
        """Parse Entitlements table."""
        entitlements: List[Dict[str, Any]] = []
        match = re.search(
            r"Entitlements\s*\nEntitlement Name Product Name Grant Date Use Count Original Use Count\s*\n(.*?)(?=\nRoles|\nAgreements|\nFortnite Profile)",
            text,
            re.DOTALL,
        )
        if not match:
            return entitlements

        for l in match.group(1).splitlines():
            l = l.strip()
            if not l or "Entitlement Name" in l:
                continue
            parts = l.split()
            if len(parts) >= 4:
                use_cnt = int(parts[-2]) if parts[-2].isdigit() else 0
                orig_cnt = int(parts[-1]) if parts[-1].isdigit() else 0
                grant_date = parts[-3]
                ent_id = parts[0]
                prod_name = " ".join(parts[1:-3])
                if prod_name in ("[----]", ""):
                    prod_name = None
                entitlements.append({
                    "entitlementId": ent_id,
                    "productName": prod_name,
                    "grantDate": grant_date,
                    "useCount": use_cnt,
                    "originalUseCount": orig_cnt,
                })
        return entitlements

    def _parse_agreements(self, text: str) -> List[Dict[str, Any]]:
        """Parse Agreements (EULA / Privacy Policy acceptances)."""
        agreements: List[Dict[str, Any]] = []
        match = re.search(
            r"Agreements\s*\nAgreement Title Accepted or Declined Date\s*\n(.*?)(?=\nFortnite Profile|\nCommunications|\nSocial Profile)",
            text,
            re.DOTALL,
        )
        if not match:
            return agreements

        for l in match.group(1).splitlines():
            l = l.strip()
            if not l or "Agreement Title" in l:
                continue
            parts = l.split()
            if len(parts) >= 3:
                date = parts[-1]
                status = parts[-2]
                title = " ".join(parts[:-2])
                agreements.append({
                    "agreementTitle": title,
                    "status": status,
                    "date": date,
                })
        return agreements

    def _parse_communication_methods(self, text: str) -> List[Dict[str, Any]]:
        """Parse Communication methods from the main document."""
        comms: List[Dict[str, Any]] = []
        match = re.search(
            r"Communication Methods\s*\nMethod Identifier Metadata\s*\n(.*?)(?=\nCurrent Communication Preferences|\nRecent Transactional|\nSocial Profile)",
            text,
            re.DOTALL,
        )
        if not match:
            return comms

        for l in match.group(1).splitlines():
            l = l.strip()
            if not l or l == "No data." or "Method Identifier" in l:
                continue
            parts = l.split()
            if len(parts) >= 2:
                method = parts[0]
                ident = parts[1]
                meta = " ".join(parts[2:]) if len(parts) > 2 else None
                comms.append({"method": method, "identifier": ident, "metadata": meta})
        return comms

    def _parse_account_history(self, text: str) -> List[Dict[str, Any]]:
        """Parse recent account events / history."""
        events: List[Dict[str, Any]] = []
        match = re.search(
            r"Account History\s*\nAction Type History \s*\nDate\s*\nUpdates\s*\n(.*?)(?=\nEntitlements|\nRoles)",
            text,
            re.DOTALL,
        )
        if not match:
            return events

        raw_lines = [l.strip() for l in match.group(1).splitlines() if l.strip()]
        curr_event: Optional[Dict[str, Any]] = None

        for l in raw_lines:
            # Event lines start with HISTORY_...
            m_event = re.match(r"^(HISTORY_[A-Z0-9_]+)\s+(\d{1,2}/\d{1,2}/\d{4})\s*(.*)", l)
            if m_event:
                if curr_event:
                    events.append(curr_event)
                curr_event = {
                    "actionType": m_event.group(1),
                    "date": m_event.group(2),
                    "updates": m_event.group(3).strip() if m_event.group(3).strip() else None,
                }
            elif curr_event:
                if curr_event["updates"]:
                    curr_event["updates"] += " " + l
                else:
                    curr_event["updates"] = l

        if curr_event:
            events.append(curr_event)
        return events

    def _parse_sessions(self, text: str) -> List[Dict[str, Any]]:
        """Parse active/recent session tokens."""
        sessions: List[Dict[str, Any]] = []
        match = re.search(
            r"Sessions\s*\nSession Name Created Expired\s*\n(.*?)(?=\nExternal Auths|\nPayment Profile)",
            text,
            re.DOTALL,
        )
        if not match:
            return sessions

        for l in match.group(1).splitlines():
            l = l.strip()
            if not l or "Session Name" in l:
                continue
            parts = l.split()
            if len(parts) >= 3:
                sessions.append({
                    "sessionName": parts[0],
                    "created": parts[1],
                    "expired": parts[2],
                })
        return sessions

    def parse_social_pdf(self) -> Dict[str, Any]:
        """Extracts friends list and social privacy preferences from Social.pdf."""
        pdf_file = self.find_file("social/social.pdf", "social.pdf")
        if not pdf_file:
            return {}

        text = extract_text_from_pdf(pdf_file)
        data: Dict[str, Any] = {
            "sourceFile": pdf_file.name,
            "friendsCount": self._extract_int(r"Friends:\s*(\d+)", text),
            "incomingFriendRequests": self._extract_int(r"Incoming\s+friend\s+requests:\s*(\d+)", text),
            "outgoingFriendRequests": self._extract_int(r"Outgoing\s+friend\s+requests:\s*(\d+)", text),
            "friendSuggestions": self._extract_int(r"Friends\s+suggestions:\s*(\d+)", text),
            "blocked": self._extract_int(r"Blocked:\s*(\d+)", text),
            "friendRequestsPrivacy": self._extract_str(r"Friend\s+requests\s+privacy:\s*([^\n]+)", text),
            "mutualFriendsVisibility": self._extract_str(r"Mutual\s+friends\s+visibility:\s*([^\n]+)", text),
        }
        return data

    def parse_communication_pdf(self) -> Dict[str, Any]:
        """Extracts detailed communication methods from Communication.pdf."""
        pdf_file = self.find_file("communication/communication.pdf", "communication.pdf")
        if not pdf_file:
            return {}

        text = extract_text_from_pdf(pdf_file)
        methods: List[Dict[str, Any]] = []
        match = re.search(
            r"Method Identifier Metadata\s*\n(.*?)(?=\nCurrent Communication Preferences|\nRecent Transactional)",
            text,
            re.DOTALL,
        )
        if match:
            for l in match.group(1).splitlines():
                l = l.strip()
                if not l or l == "No data." or "Method Identifier" in l:
                    continue
                parts = l.split()
                if len(parts) >= 2:
                    method = parts[0]
                    ident = parts[1]
                    meta = " ".join(parts[2:]) if len(parts) > 2 else None
                    methods.append({"method": method, "identifier": ident, "metadata": meta})

        return {
            "sourceFile": pdf_file.name,
            "communicationMethods": methods,
        }

    def parse_financial_pdf(self) -> Dict[str, Any]:
        """Extracts subscription orders and billing summaries from Financial.pdf."""
        pdf_file = self.find_file("financial/financial.pdf", "financial.pdf")
        if not pdf_file:
            return {}

        text = extract_text_from_pdf(pdf_file)
        return {
            "sourceFile": pdf_file.name,
            "subscriptionOrders": self._extract_int(r"Subscription\s+Orders:\s*(\d+)", text),
            "paymentTransactions": self._extract_int(r"Payment\s+Transactions:\s*(\d+)", text),
            "subscriptions": self._extract_int(r"Subscriptions:\s*(\d+)", text),
            "billingHistory": self._extract_int(r"Billing\s+History:\s*(\d+)", text),
            "actionHistories": self._extract_int(r"Action\s+Histories:\s*(\d+)", text),
        }

    def parse_all(self) -> Dict[str, Any]:
        """Parse all components of the export bundle into a unified structure."""
        main_data = self.parse_main_account_pdf()
        social_data = self.parse_social_pdf()
        comm_data = self.parse_communication_pdf()
        fin_data = self.parse_financial_pdf()

        # Combine communication methods without duplicates
        all_comms = main_data.get("communicationMethods", [])
        for c in comm_data.get("communicationMethods", []):
            if c not in all_comms:
                all_comms.append(c)

        return {
            "account": main_data.get("accountDetails", {}),
            "connectedAccounts": main_data.get("connectedAccounts", []),
            "consentedApps": main_data.get("consentedApps", []),
            "entitlements": main_data.get("entitlements", []),
            "agreements": main_data.get("agreements", []),
            "communications": {
                "methods": all_comms,
            },
            "social": social_data,
            "financial": fin_data,
            "accountHistory": main_data.get("accountHistory", []),
            "sessions": main_data.get("sessions", []),
        }

    @staticmethod
    def _camel_case(s: str) -> str:
        s = re.sub(r"[^\w\s]", "", s)
        words = s.split()
        if not words:
            return ""
        return words[0].lower() + "".join(w.capitalize() for w in words[1:])

    @staticmethod
    def _extract_int(pattern: str, text: str) -> Optional[int]:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            try:
                return int(m.group(1))
            except ValueError:
                return None
        return None

    @staticmethod
    def _extract_str(pattern: str, text: str) -> Optional[str]:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            return val if val != "No data." else None
        return None


def parse_export(input_path: str | Path) -> Dict[str, Any]:
    """Top-level entry point accepting either a ZIP archive or a directory."""
    input_path = Path(input_path)
    if not input_path.exists():
        raise FileNotFoundError(f"Export file or directory not found: {input_path}")

    if input_path.is_file() and input_path.suffix.lower() == ".zip":
        with tempfile.TemporaryDirectory() as tmpdir:
            with zipfile.ZipFile(input_path, "r") as z:
                z.extractall(tmpdir)
            parser = EpicExportParser(Path(tmpdir))
            return parser.parse_all()
    else:
        parser = EpicExportParser(input_path)
        return parser.parse_all()


def map_to_app_account_profile(export_data: Dict[str, Any], account_label: Optional[str] = None) -> Dict[str, Any]:
    """
    Transforms the extracted export data into the account profile structure
    used by the Game ID app (Accounts page, Settings page, etc.).
    """
    acct = export_data.get("account", {})
    connected = export_data.get("connectedAccounts", [])
    social = export_data.get("social", {})
    entitlements = export_data.get("entitlements", [])
    apps = export_data.get("consentedApps", [])
    comms = export_data.get("communications", {}).get("methods", [])
    agreements = export_data.get("agreements", [])

    return {
        "id": acct.get("accountId"),
        "label": account_label or acct.get("displayName") or "Epic Games Account",
        "displayName": acct.get("displayName"),
        "firstName": acct.get("firstName"),
        "lastName": acct.get("lastName"),
        "email": acct.get("email"),
        "country": acct.get("country"),
        "createdAt": acct.get("created"),
        "lastLogin": acct.get("lastLogin"),
        "status": acct.get("accountStatus"),
        "language": acct.get("communicationLanguage"),
        "addresses": acct.get("addresses", []),
        "connectedAccounts": connected,
        "communicationMethods": comms,
        "agreements": agreements,
        "entitlementCount": len(entitlements),
        "consentedAppsCount": len(apps),
        "social": {
            "friendsCount": social.get("friendsCount", 0),
            "incomingFriendRequests": social.get("incomingFriendRequests", 0),
            "outgoingFriendRequests": social.get("outgoingFriendRequests", 0),
            "blocked": social.get("blocked", 0),
            "friendRequestsPrivacy": social.get("friendRequestsPrivacy"),
            "mutualFriendsVisibility": social.get("mutualFriendsVisibility"),
        },
    }


def classify_title(title: str) -> str:
    """game | dlc | add-on | app | demo | subscription. Conservative default: game."""
    low = title.lower().strip()
    app_titles = {
        'discord', 'discord nitro',
        'voicemod: real-time ai voice changer & soundboard',
        'aimlabs', 'unreal physics', 'dreamhaven',
        'nvidia geforce now',
    }
    if low in app_titles:
        return 'subscription' if 'nitro' in low else 'app'
    if any(m in low for m in ('demo', 'prologue', 'free offer')):
        return 'demo'
    if any(m in low for m in ('starter pack', 'party favor', 'coins', 'credits', 'skin pack', 'cosmetic')):
        return 'add-on'
    if any(m in low for m in ('modding kit', 'creator kit', 'season pass', 'expansion pass', 'dlc', 'content pack')):
        return 'dlc'
    return 'game'


def map_to_app_games(export_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Transforms the 3rd party consented apps and entitlements in the export
    into game records structured according to Game ID's catalog / app schema.
    """
    apps = export_data.get("consentedApps", [])
    acct = export_data.get("account", {})
    acct_id = acct.get("accountId") or "epic_account"

    games = []
    for idx, a in enumerate(apps, 1):
        title = a.get("title", "").strip()
        if not title:
            continue

        slug_title = re.sub(r"\W+", "_", title.lower()).strip("_")
        game_id = f"epic_{acct_id[:8]}_{slug_title}_{idx}"
        cls = classify_title(title)

        game = {
            "id": game_id,
            "title": title,
            "rawTitle": title,
            "store": "Epic Games Store",
            "classification": cls,
            "publisher": a.get("organization"),
            "developer": None,
            "releaseDate": None,
            "ownership": {
                "purchaseDate": a.get("createdAt"),
                "lastUpdated": a.get("updatedAt"),
                "marketplace": "Epic Games Store",
                "transactionId": None,
                "purchasePrice": None,
                "playtimeSeconds": 0,
                "playtimeRaw": "0",
            },
            "provenance": {
                "confidence": "High" if a.get("organization") else "Medium",
                "sources": ["Epic Games Account Export", "Consented 3rd-party App"],
                "issues": [],
                "consentedScopes": a.get("consentedScopes", []),
                "privacyPolicy": a.get("privacyPolicy"),
                "supportEmail": a.get("supportEmail"),
            },
        }
        games.append(game)
    return games


def main():
    parser = argparse.ArgumentParser(description="Parse and extract Epic Games account export data.")
    parser.add_argument("--input", "-i", required=True, help="Path to EpicGamesAccountData.zip or extracted directory")
    parser.add_argument("--out", "-o", default="data/raw/account_export.json", help="Path to write JSON output")
    parser.add_argument("--profile-out", help="Path to write transformed app account profile JSON")
    parser.add_argument("--games-out", help="Path to write transformed game records JSON")
    parser.add_argument("--account-label", help="Optional display label for this account")

    args = parser.parse_args()

    print(f"Parsing Epic Games export: {args.input}")
    data = parse_export(args.input)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Export summary extracted -> {out_path} ({out_path.stat().st_size:,} bytes)")

    acct_info = data.get("account", {})
    print(f"  Account ID: {acct_info.get('accountId')}")
    print(f"  Display Name: {acct_info.get('displayName')}")
    print(f"  Email: {acct_info.get('email')}")
    print(f"  Country: {acct_info.get('country')}")
    print(f"  Connected Accounts: {len(data.get('connectedAccounts', []))}")
    print(f"  Consented 3rd-Party Games/Apps: {len(data.get('consentedApps', []))}")
    print(f"  Entitlements: {len(data.get('entitlements', []))}")

    if args.profile_out:
        prof_path = Path(args.profile_out)
        prof_path.parent.mkdir(parents=True, exist_ok=True)
        prof_data = map_to_app_account_profile(data, args.account_label)
        with prof_path.open("w", encoding="utf-8") as f:
            json.dump(prof_data, f, ensure_ascii=False, indent=2)
        print(f"Account Profile emitted -> {prof_path}")

    if args.games_out:
        games_path = Path(args.games_out)
        games_path.parent.mkdir(parents=True, exist_ok=True)
        games_data = map_to_app_games(data)
        with games_path.open("w", encoding="utf-8") as f:
            json.dump(games_data, f, ensure_ascii=False, indent=2)
        print(f"Game Records ({len(games_data)}) emitted -> {games_path}")


if __name__ == "__main__":
    main()
