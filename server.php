<?php
    require 'vendor/autoload.php';
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // to run program: php -S 127.0.0.1:8000
    if (isset($_POST['requestType'])) { 
        header("Access-Control-Allow-Origin: http://[cross.domain]");
        header("Access-Control-Allow-Headers: access");
        header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
        header("Access-Control-Allow-Credentials: true");
        switch ($_POST['requestType']) {
            // get intraday information about a stock
            case 'stockIntraDay':
                $stock = $_POST['stock'];
                $baseUrl = "https://www.alphavantage.co/query?";
                $apikey =  $_ENV['AVAPIKEY'];
                $data = array(
                    'function' => 'TIME_SERIES_INTRADAY', 
                    'symbol' => $stock, 
                    'interval' => '1min', 
                    'outputsize' => 'compact', 
                    'apikey' => $apikey
                );
                $url = $baseUrl . http_build_query($data);
                $json = file_get_contents($url);
                $data = json_decode($json, true);
                $json_data = $data;
                echo json_encode($json_data);
                exit;
            
            // get a list of active stocks
            case 'stockListings':
                $url = "https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=demo";
                $data = file_get_contents($url);
                $rows = explode("\n", $data);
                $s = array();
                foreach($rows as $row) {
                    $s[] = str_getcsv($row);
                }
                array_shift($s);
                echo json_encode($s);
                exit;
            
            case 'stockNews':
                $url = "https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&topics=technology&apikey=demo";
                $data = file_get_contents($url);
                $data = json_decode($json,true);
                echo json_encode($data);

            default:
                break;
        }
        
    }
?>