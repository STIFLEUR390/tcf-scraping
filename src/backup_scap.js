// Script unifié pour extraire les expressions écrites et orales

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

/**
 * Fonction pour scraper une page web en utilisant l'API crawl4ai
 * @param {string} url - L'URL à scraper
 * @returns {Promise<Object>} - Le contenu HTML de la page
 */
async function scrapePage(url) {
    try {
        const response = await fetch('https://crawl4ai.aplix.nl/execute_js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                scripts: [
                    "window._cf_chl_opt.cRay = '';"
                ],
                browser_config: {
                    params: {
                        bypass_tls: true,
                        executable_path: "/path/to/chromium"
                    }
                },
                crawler_config: {
                    params: {
                        challenge_timeout: 60000,
                        disable_cloudflare_cookie: false
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors du scraping:', error);
        throw error;
    }
}

/**
 * Fonction pour sauvegarder les données dans un fichier JSON
 * @param {Object} data - Les données à sauvegarder
 * @param {string} url - L'URL source
 */
function saveToJson(data, url) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scrap_${timestamp}.json`;
    const outputPath = path.join(process.cwd(), 'output', filename);

    // Créer le dossier output s'il n'existe pas
    if (!fs.existsSync(path.join(process.cwd(), 'output'))) {
        fs.mkdirSync(path.join(process.cwd(), 'output'));
    }

    const outputData = {
        url: url,
        timestamp: timestamp,
        data: data
    };

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`Données sauvegardées dans: ${outputPath}`);
}

/**
 * Fonction pour extraire le markdown des expressions écrites
 * @param {string} url - L'URL de la page d'expression écrite
 * @returns {Promise<Object>} - Les combinaisons extraites
 */
async function scrapeExpressionEcrite(url) {
    try {
        const scrapedData = await scrapePage(url);
        if (!scrapedData || !scrapedData.markdown || !scrapedData.markdown.raw_markdown) {
            throw new Error('Format de données invalide : markdown non trouvé');
        }
        const combinations = extractCombinations(scrapedData.markdown.raw_markdown);
        return combinations;
    } catch (error) {
        console.error('Erreur lors de l\'extraction du markdown:', error);
        throw error;
    }
}

/**
 * Fonction pour extraire les combinaisons et leurs tâches du markdown
 * @param {string} markdown - Le contenu markdown
 * @returns {Object} - Les combinaisons et leurs tâches
 */
function extractCombinations(markdown) {
    const combinations = {};
    const lines = markdown.split('\n');
    let currentCombination = null;
    let currentTask = null;
    let taskContent = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Détecter une nouvelle combinaison
        if (line.startsWith('Combinaison')) {
            if (currentCombination && currentTask) {
                combinations[`combinaison_${currentCombination}`][`Tache_${currentTask}`] = taskContent.join('\n').trim();
            }
            currentCombination = line.split(' ')[1];
            combinations[`combinaison_${currentCombination}`] = {
                Tache_1: '',
                Tache_2: '',
                Tache_3: ''
            };
            currentTask = null;
            taskContent = [];
            continue;
        }

        // Détecter une nouvelle tâche
        if (line.startsWith('Tâche')) {
            if (currentCombination && currentTask) {
                combinations[`combinaison_${currentCombination}`][`Tache_${currentTask}`] = taskContent.join('\n').trim();
            }
            currentTask = line.split(' ')[1];
            taskContent = [];
            continue;
        }

        // Ignorer les lignes de formatage et les liens
        if (line.startsWith('######') || line.startsWith('[') || line.startsWith('![') || line === '') {
            continue;
        }

        // Ajouter le contenu à la tâche courante
        if (currentTask && line) {
            taskContent.push(line);
        }
    }

    // Sauvegarder la dernière tâche
    if (currentCombination && currentTask) {
        combinations[`combinaison_${currentCombination}`][`Tache_${currentTask}`] = taskContent.join('\n').trim();
    }

    return { combinaison: combinations };
}

/**
 * Fonction pour extraire le markdown des expressions orales
 * @param {string} url - L'URL de la page d'expression orale
 * @returns {Promise<string>} - Le contenu markdown
 */
async function scrapeExpressionOrale(url) {
    try {
        const scrapedData = await scrapePage(url);
        if (!scrapedData || !scrapedData.markdown || !scrapedData.markdown.raw_markdown) {
            throw new Error('Format de données invalide : markdown non trouvé');
        }
        return extractTaches(scrapedData.markdown.raw_markdown);
    } catch (error) {
        console.error('Erreur lors de l\'extraction du markdown:', error);
        throw error;
    }
}

/**
 * Fonction pour extraire les tâches et leurs sujets du markdown
 * @param {string} markdown - Le contenu markdown
 * @returns {Object} - Les tâches et leurs sujets
 */
function extractTaches(markdown) {
    const taches = {};
    const lines = markdown.split('\n');
    let currentTache = null;
    let currentPartie = null;
    let currentSujet = null;
    let sujetContent = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Détecter une nouvelle tâche
        if (line.startsWith('# Tâche')) {
            if (currentTache && currentPartie && currentSujet) {
                taches[`tache_${currentTache}`][`partie_${currentPartie}`][`sujet_${currentSujet}`] = sujetContent.join('\n').trim();
            }
            currentTache = line.split(' ')[2];
            taches[`tache_${currentTache}`] = {
                partie_1: {},
                partie_2: {},
                partie_3: {}
            };
            currentPartie = null;
            currentSujet = null;
            sujetContent = [];
            continue;
        }

        // Détecter une nouvelle partie
        if (line.startsWith('Partie')) {
            if (currentTache && currentPartie && currentSujet) {
                taches[`tache_${currentTache}`][`partie_${currentPartie}`][`sujet_${currentSujet}`] = sujetContent.join('\n').trim();
            }
            currentPartie = line.split(' ')[1];
            currentSujet = null;
            sujetContent = [];
            continue;
        }

        // Détecter un nouveau sujet
        if (line.startsWith('Sujet')) {
            if (currentTache && currentPartie && currentSujet) {
                taches[`tache_${currentTache}`][`partie_${currentPartie}`][`sujet_${currentSujet}`] = sujetContent.join('\n').trim();
            }
            currentSujet = line.split(' ')[1];
            sujetContent = [];
            continue;
        }

        // Ignorer les lignes de formatage et les liens
        if (line.startsWith('######') || line.startsWith('[') || line.startsWith('![') || line === '') {
            continue;
        }

        // Ajouter le contenu au sujet courant
        if (currentTache && currentPartie && currentSujet && line) {
            sujetContent.push(line);
        }
    }

    // Sauvegarder le dernier sujet
    if (currentTache && currentPartie && currentSujet) {
        taches[`tache_${currentTache}`][`partie_${currentPartie}`][`sujet_${currentSujet}`] = sujetContent.join('\n').trim();
    }

    return { taches };
}

// Exemple d'utilisation
async function main() {
    const urlExpressionEcrite = 'https://reussir-tcfcanada.com/avril-2025-expression-ecrite/';
    const urlExpressionOrale = 'https://reussir-tcfcanada.com/mars-2025-expression-orale/';
    
    try {
        // Scraping expression écrite
        const combinations = await scrapeExpressionEcrite(urlExpressionEcrite);
        saveToJson(combinations, urlExpressionEcrite);

        // Scraping expression orale
        const markdownOral = await scrapeExpressionOrale(urlExpressionOrale);
        saveToJson(markdownOral, urlExpressionOrale);
    } catch (error) {
        console.error('Erreur dans le programme principal:', error);
    }
}

main();
