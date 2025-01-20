document.getElementById('scrape-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('url').value;

  try {
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      alert('Website scraped and saved!');
    } else {
      const error = await response.json();
      alert('Error: ' + error.error);
    }
  } catch (err) {
    console.error('Request error:', err);
  }
});
