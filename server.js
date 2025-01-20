require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const Company = require('./models/Company');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Helper function for scraping data
const scrapeWebsite = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const name = $('meta[property="og:site_name"]').attr('content') || $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const logo = $('meta[property="og:image"]').attr('content');
    const facebook = $('a[href*="facebook.com"]').attr('href');
    const linkedin = $('a[href*="linkedin.com"]').attr('href');
    const twitter = $('a[href*="twitter.com"]').attr('href');
    const instagram = $('a[href*="instagram.com"]').attr('href');
    const address = $('[itemprop="address"]').text();
    const phone = $('[itemprop="telephone"]').text();
    const email = $('a[href^="mailto:"]').text();

    return { name, description, logo, facebook, linkedin, twitter, instagram, address, phone, email, website: url };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Failed to scrape the website');
  }
};

// API routes
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  try {
    const data = await scrapeWebsite(url);
    const company = new Company(data);
    await company.save();
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies', async (req, res) => {
  const companies = await Company.find();
  res.render('companies', { companies });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
