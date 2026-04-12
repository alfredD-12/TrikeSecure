import { createWorker } from 'tesseract.js';

/**
 * Philippine driver's license OCR parser.
 *
 * Extracts the License Number and Expiration Date from a photo or scan of a
 * Philippine LTO Non-Professional / Professional driver's license.
 *
 * License Number format:  N03-12-123456  (letter, 2 digits, dash, 2 digits, dash, 6 digits)
 * Expiration Date format: 2022/10/04     (YYYY/MM/DD on the card)
 */

// Matches PH license numbers like N03-12-123456, A01-23-456789, etc.
const LICENSE_NUMBER_PATTERNS = [
  /[A-Z]\d{2}[- ]\d{2}[- ]\d{6}/g,
  /[A-Z]\d{2}\d{2}\d{6}/g,
];

// Matches dates in YYYY/MM/DD or YYYY-MM-DD format
const DATE_PATTERNS = [
  /(\d{4})[/\-.](\d{2})[/\-.](\d{2})/g,
];

function normalizeLicenseNumber(raw) {
  const cleaned = raw.replace(/\s+/g, '').toUpperCase();

  // Try to format as X##-##-######
  const match = cleaned.match(/^([A-Z])(\d{2})[-]?(\d{2})[-]?(\d{6})$/);
  if (match) {
    return `${match[1]}${match[2]}-${match[3]}-${match[4]}`;
  }

  return raw.trim();
}

function parseDateToISO(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);

  if (y < 1950 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
    return null;
  }

  return `${String(y)}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function extractLicenseNumber(text) {
  for (const pattern of LICENSE_NUMBER_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return normalizeLicenseNumber(matches[0]);
    }
  }

  return null;
}

function extractExpirationDate(text) {
  const lines = text.split('\n');

  // Strategy 1: Look for dates near "Expiration" or "Expiry" keywords
  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper.includes('EXPIR') || upper.includes('EXP DATE') || upper.includes('EXP.')) {
      for (const pattern of DATE_PATTERNS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          const iso = parseDateToISO(match[1], match[2], match[3]);
          if (iso) return iso;
        }
      }
    }
  }

  // Strategy 2: Collect all dates and pick the latest (expiry is usually the latest date)
  const allDates = [];
  for (const pattern of DATE_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const iso = parseDateToISO(match[1], match[2], match[3]);
      if (iso) {
        allDates.push(iso);
      }
    }
  }

  if (allDates.length === 0) {
    return null;
  }

  // Sort descending — last date is most likely the expiry
  allDates.sort((a, b) => b.localeCompare(a));
  return allDates[0];
}

/**
 * Run OCR on a driver's license image and extract structured fields.
 *
 * @param {File|Blob|string} imageSource - The image to process
 * @param {(progress: number) => void} [onProgress] - Progress callback (0–1)
 * @returns {Promise<{licenseNumber: string|null, expiryDate: string|null, rawText: string, confidence: number}>}
 */
export async function parseLicenseOCR(imageSource, onProgress) {
  let worker = null;

  try {
    worker = await createWorker('eng', 1, {
      logger: (info) => {
        if (onProgress && info.status === 'recognizing text') {
          onProgress(info.progress);
        }
      },
    });

    const { data } = await worker.recognize(imageSource);

    const rawText = data.text || '';
    const confidence = data.confidence || 0;

    const licenseNumber = extractLicenseNumber(rawText);
    const expiryDate = extractExpirationDate(rawText);

    return {
      licenseNumber,
      expiryDate,
      rawText,
      confidence,
    };
  } catch (error) {
    console.error('License OCR error:', error);
    return {
      licenseNumber: null,
      expiryDate: null,
      rawText: '',
      confidence: 0,
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // ignore termination errors
      }
    }
  }
}
