document.addEventListener("DOMContentLoaded", () => {
  const exchangeSelect = document.getElementById("exchange");
  const coinSelect = document.getElementById("coin");
  const addOrderBookButton = document.getElementById("addOrderBook");
  const orderBooksContainer = document.getElementById("order-books-container");

  const exchanges = ["ExchangeX", "ExchangeY"];
  const coins = ["DOGE/USD", "XRP/USD"];

  exchanges.forEach((exchange) => {
    const option = document.createElement("option");
    option.value = exchange;
    option.textContent = exchange;
    exchangeSelect.appendChild(option);
  });

  coins.forEach((coin) => {
    const option = document.createElement("option");
    option.value = coin;
    option.textContent = coin;
    coinSelect.appendChild(option);
  });

  const ws = new WebSocket(`ws://${window.location.host}`);

  ws.binaryType = "arraybuffer"; // Set binaryType to arraybuffer to handle binary messages

  ws.onmessage = async (event) => {
    const data = await parseBinaryMessage(event.data);
    updateOrderBooks(data);
  };

  const parseBinaryMessage = async (binary) => {
    const text = new TextDecoder("utf-8").decode(new Uint8Array(binary));
    return JSON.parse(text);
  };

  addOrderBookButton.addEventListener("click", () => {
    const selectedExchange = exchangeSelect.value;
    const selectedCoin = coinSelect.value;

    const orderBookElement = createOrderBookElement(
      selectedExchange,
      selectedCoin
    );
    orderBooksContainer.appendChild(orderBookElement);
  });

  const createOrderBookElement = (exchange, coin) => {
    const orderBookElement = document.createElement("div");
    orderBookElement.classList.add("order-book");
    orderBookElement.setAttribute("data-exchange", exchange);
    orderBookElement.setAttribute("data-coin", coin);

    const title = document.createElement("h2");
    title.textContent = `${exchange} - ${coin}`;
    orderBookElement.appendChild(title);

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      orderBooksContainer.removeChild(orderBookElement);
    });
    orderBookElement.appendChild(removeButton);

    const timestampElement = document.createElement("p");
    timestampElement.classList.add("timestamp");
    orderBookElement.appendChild(timestampElement);

    const bidsSection = document.createElement("div");
    bidsSection.classList.add("order-book-section");
    const bidsTitle = document.createElement("h3");
    bidsTitle.textContent = "Bids";
    const bidsList = document.createElement("ul");
    bidsList.classList.add("bids");
    bidsSection.appendChild(bidsTitle);
    bidsSection.appendChild(bidsList);

    const asksSection = document.createElement("div");
    asksSection.classList.add("order-book-section");
    const asksTitle = document.createElement("h3");
    asksTitle.textContent = "Asks";
    const asksList = document.createElement("ul");
    asksList.classList.add("asks");
    asksSection.appendChild(asksTitle);
    asksSection.appendChild(asksList);

    orderBookElement.appendChild(bidsSection);
    orderBookElement.appendChild(asksSection);

    return orderBookElement;
  };

  const updateOrderBooks = (data) => {
    const { timestamp, exchange, coin, bids, asks } = data;
    const isoTimestamp = new Date(timestamp * 1000).toISOString();

    const orderBooks = document.querySelectorAll(".order-book");
    orderBooks.forEach((orderBook) => {
      if (
        orderBook.getAttribute("data-exchange") === exchange &&
        orderBook.getAttribute("data-coin") === coin
      ) {
        const timestampElement = orderBook.querySelector(".timestamp");
        timestampElement.textContent = `Last update: ${isoTimestamp}`;

        const bidsList = orderBook.querySelector(".bids");
        const asksList = orderBook.querySelector(".asks");

        bidsList.innerHTML = "";
        asksList.innerHTML = "";

        bids.forEach((bid, index) => {
          const li = document.createElement("li");
          if (index === 0) li.classList.add("highlight");
          li.innerHTML = `<span>${bid[0]}</span><span>${bid[1]}</span>`;
          bidsList.appendChild(li);
        });

        asks.forEach((ask, index) => {
          const li = document.createElement("li");
          if (index === 0) li.classList.add("highlight");
          li.innerHTML = `<span>${ask[0]}</span><span>${ask[1]}</span>`;
          asksList.appendChild(li);
        });
      }
    });
  };
});
