import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

interface ScrapedPlace {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category: string;
    placeId: string;
}

// Find Chrome executable path
function getChromePath(): string {
    const paths = [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        process.env.CHROME_PATH || "",
    ];

    return paths.find(p => p) || paths[0];
}

export async function POST(request: Request) {
    let browser = null;

    try {
        const body = await request.json();
        const { url, query } = body;

        if (!url && !query) {
            return NextResponse.json(
                { error: "URL atau query diperlukan" },
                { status: 400 }
            );
        }

        // Build search URL
        let searchUrl = url;
        if (!searchUrl && query) {
            const searchQuery = `${query}, Ngabul, Tahunan, Jepara`;
            searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
        }

        console.log("Launching browser for:", searchUrl);

        // Launch browser (visible for debugging)
        browser = await puppeteer.launch({
            executablePath: getChromePath(),
            headless: false,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
                "--window-size=1400,900",
            ],
            defaultViewport: null,
        });

        const page = await browser.newPage();

        // Bypass bot detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });

        // Navigate to search with longer timeout
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

        // Wait for page to stabilize
        await new Promise(r => setTimeout(r, 5000));

        // Scroll to load more results
        await page.evaluate(() => {
            const feed = document.querySelector('[role="feed"]');
            if (feed) feed.scrollTop = feed.scrollHeight;
        });
        await new Promise(r => setTimeout(r, 3000));

        // Get all result items
        const places: ScrapedPlace[] = [];

        // Find links with coordinates in href
        const links = await page.$$('a[href*="/maps/place/"]');
        console.log(`Found ${links.length} place links`);

        for (let i = 0; i < Math.min(links.length, 30); i++) {
            try {
                const link = links[i];

                // Get href and aria-label
                const data = await link.evaluate((el: Element) => ({
                    href: el.getAttribute('href') || '',
                    name: el.getAttribute('aria-label') || el.textContent?.trim() || '',
                }));

                if (!data.name || !data.href) continue;

                // Extract coordinates from href
                const coordMatch = data.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                    data.href.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);

                if (!coordMatch) continue;

                const lat = parseFloat(coordMatch[1]);
                const lng = parseFloat(coordMatch[2]);

                // Filter to Ngabul area
                if (lat >= -6.70 && lat <= -6.60 && lng >= 110.65 && lng <= 110.75) {
                    places.push({
                        name: data.name.split('\n')[0].trim(),
                        address: "Ngabul, Tahunan, Jepara",
                        latitude: lat,
                        longitude: lng,
                        category: guessCategory(data.name),
                        placeId: `gmaps-${Date.now()}-${i}`,
                    });
                    console.log(`✓ ${data.name.substring(0, 40)} @ ${lat}, ${lng}`);
                }
            } catch (err) {
                console.error(`Error on item ${i}:`, err);
            }
        }

        await browser.close();
        browser = null;

        return NextResponse.json({
            query: query || "Google Maps Search",
            count: places.length,
            places,
        });

    } catch (error) {
        console.error("Scraping error:", error);

        if (browser) {
            await browser.close();
        }

        return NextResponse.json(
            { error: `Gagal scraping: ${error instanceof Error ? error.message : "Unknown error"}` },
            { status: 500 }
        );
    }
}

function guessCategory(name: string): string {
    const lower = name.toLowerCase();

    if (lower.includes("sd ") || lower.includes("sdn ") || lower.includes("smp") ||
        lower.includes("sma") || lower.includes("tk ") || lower.includes("paud") ||
        lower.includes("sekolah") || lower.includes("ma ") || lower.includes("mts")) {
        return "Pendidikan";
    }

    if (lower.includes("masjid") || lower.includes("mushola") || lower.includes("musola") ||
        lower.includes("gereja") || lower.includes("tpq") || lower.includes("madin") ||
        lower.includes("pondok") || lower.includes("pesantren")) {
        return "Tempat Ibadah";
    }

    if (lower.includes("puskesmas") || lower.includes("klinik") || lower.includes("rumah sakit") ||
        lower.includes("apotek") || lower.includes("bidan") || lower.includes("posyandu")) {
        return "Kesehatan";
    }

    if (lower.includes("kantor") || lower.includes("balai") || lower.includes("kelurahan") ||
        lower.includes("kecamatan") || lower.includes("desa")) {
        return "Pemerintahan";
    }

    if (lower.includes("toko") || lower.includes("warung") || lower.includes("pasar") ||
        lower.includes("kios") || lower.includes("minimarket")) {
        return "Ekonomi";
    }

    return "Lainnya";
}
