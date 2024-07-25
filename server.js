const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files (like index.html) from the current directory
app.use(express.static(path.join(__dirname)));

// Endpoint to get FM channels based on zip code
app.get('/fm-channels/:zip', async (req, res) => {
    const zip = req.params.zip;

    try {
        const url = `https://radio-locator.com/cgi-bin/vacant?select=city&city=${zip}&state=&x=0&y=0`;
        const { data } = await axios.get(url);

        const $ = cheerio.load(data);
        const channels = [];
        $('td.vacant.smalltype').each((index, element) => {
            const text = $(element).text().trim();
            const channelMatch = text.match(/^(\d+\.\d+)/);
            if (channelMatch) {
                channels.push(channelMatch[1]);
            }
        });

        res.json(channels);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Endpoint to get zip code based on latitude and longitude
app.get('/zipcode', async (req, res) => {
    const { lat, lon } = req.query;

    try {
        const apiKey = '9734fb38936e4efaba9db7587a11bd5f'; // Replace with your real API key
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;
        const { data } = await axios.get(url);

        if (data.results.length > 0) {
            const components = data.results[0].components;
            const zip = components.postcode || 'N/A';
            res.json({ zip });
        } else {
            res.status(404).json({ error: 'Zip code not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch zip code' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
