export default async function handler(req, res) {
  const symbols = ['AAPL','MSFT','NVDA','AMZN','GOOGL'];
  try {
    const results = await Promise.all(symbols.map(async (sym) => {
      const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const j = await r.json();
      const meta = j.chart.result[0].meta;
      return {
        symbol: sym,
        price: meta.regularMarketPrice,
        prevClose: meta.previousClose ?? meta.chartPreviousClose,
        currency: meta.currency,
        yearLow: meta.fiftyTwoWeekLow,
        yearHigh: meta.fiftyTwoWeekHigh,
        marketTime: meta.regularMarketTime
      };
    }));
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.status(200).json({ ok: true, quotes: results, fetchedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
