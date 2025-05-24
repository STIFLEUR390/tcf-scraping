require('dotenv').config();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const axios = require('axios');
const ProxyChain = require('proxy-chain');

const app = express();
const port = process.env.PORT || 3000;
const BROWSERLESS_URL = 'https://browserless.t2ol.org';

app.use(cors());
app.use(express.json());

// Fonction pour obtenir un proxy public aléatoire
async function getRandomProxy() {
    try {
        const response = await axios.get('https://proxylist.geonode.com/api/proxy-list?limit=100&page=1&sort_by=lastChecked&sort_type=desc&protocols=http%2Chttps');
        const proxies = response.data.data;
        const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
        return `http://${randomProxy.ip}:${randomProxy.port}`;
    } catch (error) {
        console.error('Erreur lors de la récupération du proxy:', error);
        return null;
    }
}

app.post('/search', async (req, res) => {
    const { url, searchText } = req.body;

    if (!url || !searchText) {
        return res.status(400).json({ error: 'URL et texte de recherche requis' });
    }

    try {
        // Obtenir un proxy aléatoire
        const proxyUrl = await getRandomProxy();
        if (!proxyUrl) {
            return res.status(500).json({ error: 'Impossible d\'obtenir un proxy' });
        }

        // Configurer le proxy
        const newProxyUrl = await ProxyChain.anonymizeProxy(proxyUrl);

        // Connexion à Browserless avec le proxy
        const browser = await puppeteer.connect({
            browserWSEndpoint: `${BROWSERLESS_URL}/devtools/browser/ws?token=${process.env.BROWSERLESS_TOKEN}`,
            args: [`--proxy-server=${newProxyUrl}`]
        });

        const page = await browser.newPage();
        
        // Configuration des en-têtes pour simuler un navigateur réel
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Attendre que la page soit complètement chargée
        await page.goto(url, { 
            waitUntil: 'networkidle0', 
            timeout: 30000 
        });

        // Attendre un peu pour s'assurer que Cloudflare est passé
        await page.waitForTimeout(5000);

        // Récupérer le contenu de la page
        const content = await page.content();
        
        // Rechercher le texte
        const found = content.toLowerCase().includes(searchText.toLowerCase());
        
        // Récupérer le contexte autour du texte si trouvé
        let context = null;
        if (found) {
            const textContent = await page.evaluate(() => document.body.innerText);
            const index = textContent.toLowerCase().indexOf(searchText.toLowerCase());
            const start = Math.max(0, index - 100);
            const end = Math.min(textContent.length, index + searchText.length + 100);
            context = textContent.substring(start, end);
        }

        await browser.close();
        await ProxyChain.closeAnonymizedProxy(newProxyUrl, true);

        res.json({
            found,
            context,
            url,
            proxy: proxyUrl
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la recherche',
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
}); 