import { simpleMovingAverage, exponentialMovingAverage } from "../public/modules/movingAverages.js";

var WINDOW = 5;

$(document).ready(function(){
    getStockListing();
    getStockFrequencies();

    $('#stockList').change(function(){
        let timeFrame = $('#timeFrame').val();
        let stock = JSON.parse($(this).val());
        let stockSymb = stock['symbol'];
        let compName = stock['coName'];
        if (!!stockSymb) {
            getStockInfo(stockSymb, compName);
        }
    })
})

function getStockListing() {
    $.ajax({
        type: "POST",
        url: "server.php",
        data: {'requestType': 'stockListings'}
    }).done(function(msg) {
        let stockOptionElem = "<option value='0' class='default text'>Select Stock</option>";
        msg = JSON.parse(msg);
        for (let i = 0; i < msg.length; i++) {
            stockOptionElem += `<option class='item' value='{"symbol":"${msg[i][0]}", "coName": "${msg[i][1]}"}'>${msg[i][1]}</option>`;
        }
        $('#stockList').append(stockOptionElem);
        $('#stockList').select2();
    })
}

function getStockFrequencies() {
    $.getJSON("./public/json/stockFrequencies.json", function(json) {
        let frequencyOptionsElem = "";
        for (let i = 0; i < json.length; i++) {
            let frequency = json[i].Freq;
            let interval = json[i].Interval;
            frequencyOptionsElem += 
            `<option value='${frequency}-${interval}'>${frequency} ${interval ? `(${interval} interval)` : ''}</option>`
        }
        $('#timeFreq').append(frequencyOptionsElem);
        $('#timeFreq').select2({  minimumResultsForSearch: -1 });
    })
}

function getStockInfo(stockSymb, compName) {
    $.ajax({
        type: "POST",
        url: "server.php",
        data: {'requestType': 'stockIntraDay', 'stock': stockSymb}
    }).done(function(stockInfo) {
        let stockInfoParsed = JSON.parse(stockInfo);
        let metaData = stockInfoParsed["Meta Data"];
        let stocks = stockInfoParsed["Time Series (1min)"];
        var dates = [];
        var close = [];
        var high = [];
        var low = [];
        var open = [];

        // create title and other information for stock graph header
        let lastRefreshedTime = metaData["3. Last Refreshed"];
        let interval = metaData["4. Interval"];
        let timeZone = metaData["6. Time Zone"];

        let stockGraphTitle = $("<h2>").text(`Showing Intraday data for ${compName}`);
        let stockGraphRefreshTime = $("<p>").text(`Last refreshed at ${lastRefreshedTime} (${timeZone})`);
        $("#stocksGraphHeader").empty().prepend(stockGraphRefreshTime);
        $("#stocksGraphHeader").prepend(stockGraphTitle);

        // go through stock information and append values to beginning of array
        // array will be read from idx 0 -> n, so add values from oldest to most recent information
        for (let date in stocks) {
            let values = stocks[date];
            dates.unshift(date);
            open.unshift(parseFloat(values['1. open']));
            high.unshift(parseFloat(values['2. high']));
            low.unshift(parseFloat(values['3. low']));
            close.unshift(parseFloat(values['4. close']));
        }
        var trace1 = {
            showlegend: false, 
            x: dates, 
            
            close: close, 
            
            decreasing: {line: {color: '#D42520'}}, 
            
            high: high, 
            
            increasing: {line: {color: '#6AAA4E'}}, 
            
            line: {color: 'rgba(31,119,180,1)'}, 
            
            low: low,
            
            open: open,
            
            type: 'candlestick', 
            xaxis: 'x', 
            yaxis: 'y'
        };
        
        let sma = simpleMovingAverage(close, WINDOW);
        let smaDates = [...dates];
        smaDates.splice(0, WINDOW-1);
        console.log(sma, smaDates);
        var trace2 = {
            name: "5-day SMA",
            type: "scatter",
            x: smaDates,
            y: sma,
            type: 'lines',
            line: {color: '#3875D1'}
        }

        let ema = exponentialMovingAverage(close, WINDOW);
        let emaDates = [...dates];
        emaDates.splice(0, WINDOW-1);
        console.log(emaDates, ema);
        var trace3 = {
            name: "5-day EMA",
            type: "scatter",
            x: emaDates,
            y: ema,
            type: 'lines',
            line: {color: '#F1F101'}
        }

        var data = [trace1, trace2, trace3];
        
        var layout = {
            plot_bgcolor: "#202020",
            paper_bgcolor: "#202020",
            dragmode: 'zoom', 
            margin: {
                r: 10, 
                t: 25, 
                b: 40, 
                l: 60
            }, 
            legend: {
                font: {
                    family: 'sans-serif',
                    size: 14,
                    color: '#ABA4A4'
                  }
            },
            xaxis: {
                autorange: true, 
                domain: [0, 1], 
                range: [dates[0], dates[dates.length-1]], 
                rangeslider: {range: [dates[0], dates[dates.length-1]]}, 
                title: 'Date', 
                type: 'date'
            }, 
            yaxis: {
                autorange: true, 
                domain: [0, 1], 
                range: [Math.min(low), Math.max(high)], 
                type: 'linear'
            }
        };
        Plotly.newPlot('stocksGraph', data, layout);
    })
}
