/* ==========================================================================
   Game ID — Client-Side Epic Export Extractor Service
   Runs 100% in browser (works on GitHub Pages and offline).
   Uses bundled JSZip + PDF.js to extract account metadata and game data.
   ========================================================================== */

import { lookupGame, generateFallbackCover, normalizeTitle } from './game-catalog-db.js';

/**
 * Extracts plain text from a PDF Uint8Array or ArrayBuffer using PDF.js.
 */
async function extractTextFromPDF(pdfData) {
  if (typeof window.pdfjsLib === 'undefined') {
    throw new Error('PDF.js library is not loaded');
  }

  // Set worker source
  if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = './vendor/pdf.worker.min.js';
  }

  const loadingTask = window.pdfjsLib.getDocument({ data: pdfData });
  const doc = await loadingTask.promise;
  const pageTexts = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();

    // Group text items by Y coordinate to preserve exact layout lines
    const lines = [];
    let currentY = null;
    let currentLine = [];

    for (const item of textContent.items) {
      const str = item.str;
      const y = item.transform ? item.transform[5] : null;

      if (y !== null) {
        if (currentY === null || Math.abs(y - currentY) < 3.5) {
          currentLine.push(str);
          currentY = y;
        } else {
          lines.push(currentLine.join(''));
          currentLine = [str];
          currentY = y;
        }
      } else {
        currentLine.push(str);
      }
    }
    if (currentLine.length) lines.push(currentLine.join(''));

    pageTexts.push(lines.join('\n'));
  }

  return pageTexts.join('\n');
}

/**
 * Parses all sections from the extracted PDF text.
 */
function parseAccountPdfText(fullText) {
  // 1. Account Details
  const accountDetails = {};
  const detailsMatch = fullText.match(/Account Details\s*\n([\s\S]*?)(?=\nMore Account Info|\nAddresses)/i);
  if (detailsMatch) {
    detailsMatch[1].split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const k = toCamelCase(line.slice(0, idx).trim());
        const v = line.slice(idx + 1).trim();
        accountDetails[k] = (v === '[----]' || v === '') ? null : v;
      }
    });
  }

  // More Account Info
  const moreMatch = fullText.match(/More Account Info\s*\n([\s\S]*?)(?=\nAddresses|\n3rd Party Apps)/i);
  if (moreMatch) {
    moreMatch[1].split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const k = toCamelCase(line.slice(0, idx).trim());
        const v = line.slice(idx + 1).trim();
        accountDetails[k] = (v === '[----]' || v === '') ? null : v;
      }
    });
  }

  // Addresses
  const addrMatch = fullText.match(/Addresses\s*\nName Postal Code Address line 1 Address line 2 City Country Region\s*\n([\s\S]*?)(?=\n3rd Party Apps|\nDevices|\nSessions)/i);
  const addresses = [];
  if (addrMatch) {
    addrMatch[1].split('\n').forEach(line => {
      const l = line.trim();
      if (l && !l.startsWith('3rd Party Apps') && !l.startsWith('Devices') && !l.startsWith('Sessions')) {
        addresses.push(l);
      }
    });
  }
  accountDetails.addresses = addresses;

  // 2. Connected Accounts (External Auths)
  const connectedAccounts = [];
  const extMatch = fullText.match(/External Auths\s*\nAuth Type External Auth ID External Display Name Added Date External Auths\s*\n([\s\S]*?)(?=\nPayment Profile|\nTransaction History|\nCode Redemptions|\nAccount History)/i);
  if (extMatch) {
    const lines = extMatch[1].split('\n').map(l => l.trim()).filter(Boolean);
    const prefixes = ['github', 'google', 'ubisoft', 'steam', 'playstation', 'psn', 'xbox', 'nintendo', 'apple', 'facebook', 'twitch', 'amazon', 'discord'];
    const merged = [];

    for (const l of lines) {
      if (prefixes.some(p => l.toLowerCase().startsWith(p))) {
        merged.push(l);
      } else if (merged.length > 0) {
        // Handle wrapped UUID
        if (/^[0-9a-fA-F]\b/.test(l) && merged[merged.length - 1].includes('-')) {
          const parts = l.split(/\s+/);
          const prevParts = merged[merged.length - 1].split(/\s+/);
          if (prevParts.length >= 2) {
            prevParts[1] += parts[0];
            merged[merged.length - 1] = prevParts.join(' ') + (parts.length > 1 ? ' ' + parts.slice(1).join(' ') : '');
          } else {
            merged[merged.length - 1] += ' ' + l;
          }
        } else {
          merged[merged.length - 1] += ' ' + l;
        }
      } else {
        merged.push(l);
      }
    }

    for (const line of merged) {
      let tokens = line.split(/\s+/);
      if (tokens.length >= 3) {
        const authType = tokens[0];
        tokens = tokens.slice(1);
        if (tokens[tokens.length - 1] === '[----]') {
          tokens.pop();
        }
        let addedDate = null;
        if (tokens.length > 0 && /\d{1,2}\/\d{1,2}\/\d{4}/.test(tokens[tokens.length - 1])) {
          addedDate = tokens.pop();
        }
        const authId = tokens[0] || null;
        const dispName = tokens.length > 1 ? tokens.slice(1).join(' ') : authId;

        connectedAccounts.push({
          authType,
          externalAuthId: authId,
          externalDisplayName: dispName,
          addedDate,
        });
      }
    }
  }

  // 3. 3rd Party Consented Apps
  const consentedApps = [];
  const appsMatch = fullText.match(/3rd Party Apps with Consent to Collect Epic Data\s*\n([\s\S]*?)(?=\nDevices|\nSessions|\nExternal Auths)/i);
  if (appsMatch) {
    const rawLines = appsMatch[1].split('\n');
    let curr = {};

    for (const line of rawLines) {
      const l = line.trim();
      if (!l || l === 'Consented Scopes:' || l === 'No data.') continue;

      if (l.startsWith('Created at:')) {
        curr.createdAt = l.replace('Created at:', '').trim();
      } else if (l.startsWith('Updated at:')) {
        curr.updatedAt = l.replace('Updated at:', '').trim();
      } else if (l.startsWith('Organization Name:')) {
        curr.organization = l.replace('Organization Name:', '').trim();
      } else if (l.startsWith('Privacy Policy:')) {
        curr.privacyPolicy = l.replace('Privacy Policy:', '').trim();
      } else if (l.startsWith('Support Email:')) {
        curr.supportEmail = l.replace('Support Email:', '').trim();
      } else if (l.startsWith('Consented Scopes:')) {
        curr.consentedScopes = l.replace('Consented Scopes:', '').split(',').map(s => s.trim()).filter(Boolean);
      } else {
        if (curr.organization || curr.createdAt) {
          if (curr.title) consentedApps.push(curr);
          curr = { title: l };
        } else {
          if (curr.title) {
            curr.title += ' ' + l;
          } else {
            curr = { title: l };
          }
        }
      }
    }
    if (curr.title) consentedApps.push(curr);
  }

  // 4. Entitlements
  const entitlements = [];
  const entMatch = fullText.match(/Entitlements\s*\nEntitlement Name Product Name Grant Date Use Count Original Use Count\s*\n([\s\S]*?)(?=\nRoles|\nAgreements|\nFortnite Profile)/i);
  if (entMatch) {
    entMatch[1].split('\n').forEach(line => {
      const l = line.trim();
      if (!l || l.includes('Entitlement Name')) return;
      const parts = l.split(/\s+/);
      if (parts.length >= 4) {
        const useCnt = parseInt(parts[parts.length - 2], 10) || 0;
        const origCnt = parseInt(parts[parts.length - 1], 10) || 0;
        const grantDate = parts[parts.length - 3];
        const entId = parts[0];
        let prodName = parts.slice(1, parts.length - 3).join(' ');
        if (prodName === '[----]' || !prodName) prodName = null;

        entitlements.push({
          entitlementId: entId,
          productName: prodName,
          grantDate,
          useCount: useCnt,
          originalUseCount: origCnt,
        });
      }
    });
  }

  // 5. Agreements
  const agreements = [];
  const agrMatch = fullText.match(/Agreements\s*\nAgreement Title Accepted or Declined Date\s*\n([\s\S]*?)(?=\nFortnite Profile|\nCommunications|\nSocial Profile)/i);
  if (agrMatch) {
    agrMatch[1].split('\n').forEach(line => {
      const l = line.trim();
      if (!l || l.includes('Agreement Title')) return;
      const parts = l.split(/\s+/);
      if (parts.length >= 3) {
        const date = parts[parts.length - 1];
        const status = parts[parts.length - 2];
        const title = parts.slice(0, parts.length - 2).join(' ');
        agreements.push({ agreementTitle: title, status, date });
      }
    });
  }

  // 6. Communications
  const communications = [];
  const commMatch = fullText.match(/Communication Methods\s*\nMethod Identifier Metadata\s*\n([\s\S]*?)(?=\nCurrent Communication Preferences|\nRecent Transactional|\nSocial Profile)/i);
  if (commMatch) {
    commMatch[1].split('\n').forEach(line => {
      const l = line.trim();
      if (!l || l === 'No data.' || l.includes('Method Identifier')) return;
      const parts = l.split(/\s+/);
      if (parts.length >= 2) {
        const method = parts[0];
        const identifier = parts[1];
        const metadata = parts.length > 2 ? parts.slice(2).join(' ') : null;
        communications.push({ method, identifier, metadata });
      }
    });
  }

  return {
    account: accountDetails,
    connectedAccounts,
    consentedApps,
    entitlements,
    agreements,
    communications: { methods: communications },
  };
}

function parseSocialPdfText(text) {
  const getInt = (pat) => {
    const m = text.match(pat);
    return m ? parseInt(m[1], 10) : 0;
  };
  const getStr = (pat) => {
    const m = text.match(pat);
    return m ? m[1].trim() : null;
  };

  return {
    friendsCount: getInt(/Friends:\s*(\d+)/i),
    incomingFriendRequests: getInt(/Incoming\s+friend\s+requests:\s*(\d+)/i),
    outgoingFriendRequests: getInt(/Outgoing\s+friend\s+requests:\s*(\d+)/i),
    friendSuggestions: getInt(/Friends\s+suggestions:\s*(\d+)/i),
    blocked: getInt(/Blocked:\s*(\d+)/i),
    friendRequestsPrivacy: getStr(/Friend\s+requests\s+privacy:\s*([^\n]+)/i),
    mutualFriendsVisibility: getStr(/Mutual\s+friends\s+visibility:\s*([^\n]+)/i),
  };
}

function parseFinancialPdfText(text) {
  const getInt = (pat) => {
    const m = text.match(pat);
    return m ? parseInt(m[1], 10) : 0;
  };

  return {
    subscriptionOrders: getInt(/Subscription\s+Orders:\s*(\d+)/i),
    paymentTransactions: getInt(/Payment\s+Transactions:\s*(\d+)/i),
    subscriptions: getInt(/Subscriptions:\s*(\d+)/i),
    billingHistory: getInt(/Billing\s+History:\s*(\d+)/i),
    actionHistories: getInt(/Action\s+Histories:\s*(\d+)/i),
  };
}

function classifyTitle(title) {
  const low = (title || '').toLowerCase().trim();
  const appTitles = new Set([
    'discord', 'discord nitro',
    'voicemod: real-time ai voice changer & soundboard',
    'aimlabs', 'unreal physics', 'dreamhaven',
    'nvidia geforce now',
  ]);
  if (appTitles.has(low)) return low.includes('nitro') ? 'subscription' : 'app';
  if (['demo', 'prologue', 'free offer'].some(m => low.includes(m))) return 'demo';
  if (['starter pack', 'party favor', 'coins', 'credits', 'skin pack', 'cosmetic'].some(m => low.includes(m))) return 'add-on';
  if (['modding kit', 'creator kit', 'season pass', 'expansion pass', 'dlc', 'content pack'].some(m => low.includes(m))) return 'dlc';
  return 'game';
}

function toCamelCase(s) {
  return s
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

/**
 * Main function: Process a dropped or selected File (.zip or .pdf).
 * Returns complete structured extraction result.
 */
export async function extractFromZipOrFile(file, onProgress) {
  if (!file) throw new Error('No file provided');

  if (onProgress) onProgress({ status: 'reading', message: `Reading ${file.name}...` });

  const filename = file.name.toLowerCase();

  // If directly a PDF
  if (filename.endsWith('.pdf')) {
    if (onProgress) onProgress({ status: 'parsing', message: 'Extracting PDF content...' });
    const buffer = await file.arrayBuffer();
    const text = await extractTextFromPDF(new Uint8Array(buffer));
    const result = parseAccountPdfText(text);
    return finalizeResult(result, file.name);
  }

  // If a ZIP archive
  if (typeof window.JSZip === 'undefined') {
    throw new Error('JSZip library is not loaded');
  }

  const zip = new window.JSZip();
  const zipContent = await zip.loadAsync(file);
  const filesList = Object.keys(zipContent.files);

  if (onProgress) onProgress({ status: 'unzipping', message: `Examining ${filesList.length} files in ZIP...` });

  let mainAccountText = '';
  let socialText = '';
  let financialText = '';

  for (const name of filesList) {
    const lowName = name.toLowerCase();
    if (lowName.endsWith('.pdf')) {
      const entry = zipContent.files[name];
      if (entry.dir) continue;

      if (onProgress) onProgress({ status: 'extracting', message: `Parsing ${name}...` });
      const pdfBytes = await entry.async('uint8array');
      const text = await extractTextFromPDF(pdfBytes);

      if (lowName.includes('accountdata') || lowName.includes('legacy/')) {
        mainAccountText = text;
      } else if (lowName.includes('social')) {
        socialText = text;
      } else if (lowName.includes('financial')) {
        financialText = text;
      }
    }
  }

  if (!mainAccountText) {
    // Fallback: pick the largest text extracted
    for (const name of filesList) {
      if (name.toLowerCase().endsWith('.pdf')) {
        const pdfBytes = await zipContent.files[name].async('uint8array');
        mainAccountText = await extractTextFromPDF(pdfBytes);
        break;
      }
    }
  }

  if (!mainAccountText) {
    throw new Error('Could not find EpicGamesAccountData PDF inside the ZIP archive.');
  }

  const mainResult = parseAccountPdfText(mainAccountText);
  if (socialText) mainResult.social = parseSocialPdfText(socialText);
  if (financialText) mainResult.financial = parseFinancialPdfText(financialText);

  return finalizeResult(mainResult, file.name);
}

function finalizeResult(raw, sourceName) {
  const acct = raw.account || {};
  const connected = raw.connectedAccounts || [];
  const apps = raw.consentedApps || [];
  const entitlements = raw.entitlements || [];
  const social = raw.social || {};

  // Formatted Profile
  const profile = {
    id: acct.accountId || 'epic_account',
    displayName: acct.displayName || 'Unknown',
    firstName: acct.firstName || '',
    lastName: acct.lastName || '',
    fullName: [acct.firstName, acct.lastName].filter(Boolean).join(' ') || acct.displayName || 'User',
    email: acct.email || '',
    country: acct.country || 'Unknown',
    createdAt: acct.created || '',
    lastLogin: acct.lastLogin || '',
    status: acct.accountStatus || 'ACTIVE',
    language: acct.communicationLanguage || 'English',
    addresses: acct.addresses || [],
    connectedAccounts: connected,
    communicationMethods: raw.communications?.methods || [],
    agreements: raw.agreements || [],
    entitlementCount: entitlements.length,
    consentedAppsCount: apps.length,
    social: {
      friendsCount: social.friendsCount || 0,
      incomingFriendRequests: social.incomingFriendRequests || 0,
      outgoingFriendRequests: social.outgoingFriendRequests || 0,
      blocked: social.blocked || 0,
    },
    sourceFile: sourceName,
    extractedAt: new Date().toISOString(),
  };

  // Formatted Games & Items
  const acctPrefix = (acct.accountId || 'epic').slice(0, 8);
  const seenTitles = new Set();
  const rawItemList = [];

  // 1. Gather all titles from consentedApps
  apps.forEach(a => {
    const title = (a.title || '').trim();
    if (!title) return;
    const key = normalizeTitle(title);
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      rawItemList.push({
        title,
        organization: a.organization,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        consentedScopes: a.consentedScopes,
        privacyPolicy: a.privacyPolicy,
        supportEmail: a.supportEmail,
        source: 'Consented 3rd-party App',
      });
    }
  });

  // 2. Also gather any additional games from entitlements (if present)
  entitlements.forEach(e => {
    const title = (e.productName || '').trim();
    if (!title || title.length < 2) return;
    const key = normalizeTitle(title);
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      rawItemList.push({
        title,
        organization: null,
        createdAt: e.grantDate,
        updatedAt: null,
        consentedScopes: [],
        privacyPolicy: null,
        supportEmail: null,
        source: 'Account Entitlement',
        entitlementId: e.entitlementId,
      });
    }
  });

  const games = rawItemList.map((item, idx) => {
    const title = item.title;
    const slug = title.toLowerCase().replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '');
    const cls = classifyTitle(title);
    const enriched = lookupGame(title);

    const isF2P = enriched ? (enriched.isFree === true) : (cls === 'app' || cls === 'subscription' || cls === 'demo');
    const msrp = enriched?.msrp != null ? enriched.msrp : (isF2P ? 0.0 : 19.99);
    const currentPrice = enriched?.current != null ? enriched.current : msrp;
    const currency = enriched?.currency || 'USD';
    const genres = enriched?.genres?.length ? enriched.genres : (cls === 'game' ? ['Action'] : []);
    const coverUrl = enriched?.cover || (enriched?.steamAppId ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${enriched.steamAppId}/header.jpg` : generateFallbackCover(title, genres[0] || 'Game'));
    const backgroundUrl = enriched?.background || (enriched?.steamAppId ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${enriched.steamAppId}/page_bg_raw.jpg` : null);

    return {
      id: `epic_${acctPrefix}_${slug}_${idx + 1}`,
      title,
      rawTitle: title,
      store: 'Epic Games Store',
      classification: enriched?.classification || cls,
      publisher: enriched?.publisher || item.organization || 'Epic Games Store',
      developer: enriched?.developer || item.organization || null,
      releaseDate: enriched?.releaseDate || null,
      cover: coverUrl,
      background: backgroundUrl,
      screenshots: enriched?.screenshots || [],
      genres: genres,
      themes: enriched?.themes || [],
      tags: enriched?.tags || [],
      platforms: enriched?.platforms || ['windows'],
      summary: enriched?.summary || null,
      about: enriched?.about || null,
      ratings: {
        metacritic: enriched?.metacritic ?? null,
        steam: enriched?.steamScore ?? null,
        steamReviewCount: enriched?.steamReviewCount ?? null,
        igdbCritic: null,
        igdbUser: null,
        opencritic: null,
      },
      pricing: {
        currency: currency,
        msrp: msrp,
        current: currentPrice,
        discountPercent: isF2P ? 0 : 100, // Acquired 100% free via Epic promotion
        historicalLowest: msrp,
      },
      isFree: isF2P, // True ONLY for actual free-to-play titles/apps, not paid giveaway games!
      acquisitionType: 'free_claim', // 100% discount promo acquisition
      features: enriched?.features || {},
      ownership: {
        purchaseDate: item.createdAt || null,
        lastUpdated: item.updatedAt || null,
        marketplace: 'Epic Games Store',
        transactionId: item.entitlementId || null,
        purchasePrice: 0, // Acquired at $0 in promo
        amountPaid: 0,
        playtimeSeconds: 0,
        playtimeRaw: '0',
      },
      provenance: {
        confidence: enriched ? 'High' : (item.organization ? 'Medium' : 'Low'),
        sources: ['Epic Games Account Export', item.source, enriched ? 'Steam Store Catalog' : null].filter(Boolean),
        issues: [],
        steamAppId: enriched?.steamAppId || null,
        consentedScopes: item.consentedScopes || [],
        privacyPolicy: item.privacyPolicy || null,
        supportEmail: item.supportEmail || null,
      },
    };
  });

  return {
    raw,
    profile,
    games,
    entitlements,
  };
}
