document.getElementById('getStarted').addEventListener('click', function() {
  document.getElementById('instructions').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('StartSwapping').addEventListener('click', function() {
  document.getElementById('swapper').scrollIntoView({ behavior: 'smooth' });
});

$(document).ready(function() {
  const sellCurrencySelect = $('#sellCurrency');
  const buyCurrencySelect = $('#buyCurrency');
  const sellAmountInput = $('#sellAmount');
  const buyAmountInput = $('#buyAmount');
  const sellValue = $('#sellValue');
  const buyValue = $('#buyValue');
  const conversionRateDisplay = $('#conversionRate');
  const swapButton = $('#swapButton');
  const connectWalletButton = $('#connectWalletButton');
  const walletOverlay = $('#walletOverlay');
  const closeOverlay = $('#closeOverlay');

  let rates = {};

  fetch('prices.json')
      .then(response => response.json())
      .then(data => {
          data.forEach(item => {
              rates[item.currency] = item.price;

              const optionSell = `<option value="${item.currency}"><img src="images/tokens/${item.currency}.svg" onerror="this.src='images/tokens/${item.currency}.avif';" /> ${item.currency}</option>`;
              sellCurrencySelect.append(optionSell);

              const optionBuy = `<option value="${item.currency}"><img src="images/tokens/${item.currency}.svg" onerror="this.src='images/tokens/${item.currency}.avif';" /> ${item.currency}</option>`;
              buyCurrencySelect.append(optionBuy);
          });

          sellCurrencySelect.select2({
              placeholder: "Select Currency",
              allowClear: true,
              templateResult: formatState,
              templateSelection: formatState
          });

          buyCurrencySelect.select2({
              placeholder: "Select Currency",
              allowClear: true,
              templateResult: formatState,
              templateSelection: formatState
          });

      })
      .catch(error => console.error('Error fetching rates:', error));

  function formatState(state) {
      if (!state.id) {
          return state.text;
      }
      const baseUrl = "images/tokens";
      const $state = $(
          `<span><img src="${baseUrl}/${state.id}.svg" onerror="this.src='${baseUrl}/${state.id}.avif';" class="img-flag" style="width: 20px; height: 20px; margin-right: 10px;" /> ${state.text}</span>`
      );
      return $state;
  }

  function updateValues() {
      const sellCurrency = sellCurrencySelect.val();
      const buyCurrency = buyCurrencySelect.val();


      if (!sellCurrency || !buyCurrency) {
          conversionRateDisplay.text("Please select both currencies.");
          sellValue.text("$0.00");
          buyValue.text("$0.00");
          buyAmountInput.val("");
          return;
      }

      const sellCurrencyUpper = sellCurrency.toUpperCase();
      const buyCurrencyUpper = buyCurrency.toUpperCase();
      const sellAmount = parseFloat(sellAmountInput.val()) || 0;

      if (rates[sellCurrencyUpper] && rates[buyCurrencyUpper]) {
          const sellRate = rates[sellCurrencyUpper];
          const buyRate = rates[buyCurrencyUpper];
          const buyAmount = (sellAmount * sellRate) / buyRate;

          sellValue.text(`$${(sellAmount * sellRate).toFixed(2)}`);
          buyAmountInput.val(buyAmount.toFixed(2));
          buyValue.text(`$${(buyAmount * buyRate).toFixed(2)}`);

          const conversionRate = (buyRate / sellRate).toFixed(6);
          conversionRateDisplay.text(`1 ${sellCurrencyUpper} = ${conversionRate} ${buyCurrencyUpper}`);
      } else {
        console.error("Rates for the selected currencies are not available.");
        conversionRateDisplay.text("Conversion rate not available.");
        sellValue.text("$0.00");
        buyValue.text("$0.00");
        buyAmountInput.val("");
    }
  }

  function swapCurrencies() {
      const tempCurrency = sellCurrencySelect.val();
      sellCurrencySelect.val(buyCurrencySelect.val()).trigger('change');
      buyCurrencySelect.val(tempCurrency).trigger('change');

      updateValues();
  }

  sellAmountInput.on('input', updateValues);
  sellCurrencySelect.on('change', updateValues);
  buyCurrencySelect.on('change', updateValues);
  swapButton.on('click', swapCurrencies);

  connectWalletButton.on('click', () => {
      walletOverlay.addClass('show');
  });

  closeOverlay.on('click', () => {
      walletOverlay.removeClass('show');
  });

  $(window).on('click', (event) => {
      if ($(event.target).is(walletOverlay)) {
          walletOverlay.removeClass('show');
      }
  });
});
