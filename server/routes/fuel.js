const express = require('express');

const router = express.Router();

const GASWATCH_URL = 'https://gaswatchph.com/';
const CACHE_TTL_MS = 30 * 60 * 1000;

let cachedSnapshot = null;
let cachedAt = 0;

function normalizeText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8369;|&peso;/g, 'P')
    .replace(/\u20b1/g, 'P')
    .replace(/\s+/g, ' ')
    .trim();
}

function toNumber(value) {
  const parsed = Number(String(value || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseGasWatchSnapshot(html) {
  const text = normalizeText(html);

  const asOf = text.match(/As of ([A-Za-z]+ \d{1,2}, \d{4})/i)?.[1] || null;
  const week = text.match(/week of ([A-Za-z]+ \d{1,2}\s*[\u2013-]\s*\d{1,2}, \d{4})/i)?.[1] || null;
  const averages = text.match(/average diesel price is P?([\d.]+)\/L and unleaded is P?([\d.]+)\/L/i);
  const cheapestDiesel = text.match(/Cheapest Diesel P?([\d.]+)\s+([A-Za-z0-9 .'-]+?)(?=\s+P?[\d.]+\s+below|\s+Cheapest Unleaded|$)/i);
  const cheapestUnleaded = text.match(/Cheapest Unleaded P?([\d.]+)\s+([A-Za-z0-9 .'-]+?)(?=\s+P?[\d.]+\s+below|\s+Metro Manila averages|$)/i);

  if (!averages && !cheapestDiesel && !cheapestUnleaded) {
    throw new Error('GasWatchPH snapshot format was not recognized.');
  }

  return {
    source: 'GasWatch PH',
    sourceUrl: GASWATCH_URL,
    area: 'Metro Manila',
    asOf,
    week,
    updatedAt: new Date().toISOString(),
    average: {
      diesel: toNumber(averages?.[1]),
      unleaded: toNumber(averages?.[2]),
    },
    cheapest: {
      diesel: {
        price: toNumber(cheapestDiesel?.[1]),
        brand: cheapestDiesel?.[2]?.trim() || null,
      },
      unleaded: {
        price: toNumber(cheapestUnleaded?.[1]),
        brand: cheapestUnleaded?.[2]?.trim() || null,
      },
    },
  };
}

async function fetchFuelSnapshot() {
  const now = Date.now();
  if (cachedSnapshot && now - cachedAt < CACHE_TTL_MS) {
    return cachedSnapshot;
  }

  const response = await fetch(GASWATCH_URL, {
    headers: {
      accept: 'text/html',
      'user-agent': 'TrikeSecure/1.0 fuel-price-check',
    },
  });

  if (!response.ok) {
    throw new Error(`GasWatchPH responded with ${response.status}.`);
  }

  const html = await response.text();
  cachedSnapshot = parseGasWatchSnapshot(html);
  cachedAt = now;
  return cachedSnapshot;
}

router.get('/prices', async (req, res) => {
  try {
    const snapshot = await fetchFuelSnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error('Fuel price fetch error:', error.message);
    res.status(502).json({
      message: 'Fuel prices are temporarily unavailable.',
      source: 'GasWatch PH',
      sourceUrl: GASWATCH_URL,
    });
  }
});

module.exports = router;
