let quoteData;

function setup() {
  fetchQuote(); // Initial fetch
  setInterval(fetchQuote, 30000); // Fetch a new quote every 30 seconds
}

function fetchQuote() {
  let url = 'https://api.quotable.io/random';
  fetch(url)
    .then(response => response.json())
    .then(data => processQuote(data));
}

function processQuote(data) {
  quoteData = data;
  document.getElementById('quote').innerText = quoteData.content;
  document.getElementById('author').innerText = `- ${quoteData.author}`;
}

// Call setup to initialize
setup();