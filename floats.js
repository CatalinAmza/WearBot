var http = require('http');
var io = require('socket.io-client');
var mongodb = require('mongodb');
var client = mongodb.MongoClient;
var dburl = 'mongodb://localhost:27017/floats';
var prices = {};
var wears = {};
var names = {};
var listingsIDs = {};
var inspectLinks = {};
var assets = [];
var lastReset = 0;
var count = 0;
var linkToWep = {};
var head = 'http://steamcommunity.com/market/listings/730/';
var tail = '/render/?query=&start=%start%&count=100&country=FR&language=english&currency=3';
var wepToWear = {
    'Desert Eagle | Cobalt Disruption (Factory New)': 0.00,
    'P250 | Nuclear Threat (Minimal Wear)': 0.07,
    '★ Flip Knife | Crimson Web (Minimal Wear)': 0.07,
    'AK-47 | Point Disarray (Factory New)': 0.00,
    'AK-47 | Aquamarine Revenge (Factory New)': 0.00,
    'AK-47 | Frontside Misty (Factory New)': 0.00,
    'Desert Eagle | Sunset Storm 壱 (Factory New)': 0.00,
    'M4A4 | Asiimov (Field-Tested)': 0.18,
    'M4A1-S | Cyrex (Factory New)': 0.00,
    'M4A4 | X-Ray (Factory New)': 0.00,
    'AK-47 | Redline (Minimal Wear)': 0.10,
    'M4A1-S | Icarus Fell (Factory New)': 0.00,
    'CZ75-Auto | Poison Dart (Factory New)': 0.00,
    'CZ75-Auto | Pole Position (Factory New)': 0.00,
    'CZ75-Auto | Nitro (Factory New)': 0.06,
    'CZ75-Auto | Emerald (Factory New)': 0.00,
    'CZ75-Auto | Tuxedo (Factory New)': 0.00,
    'Five-SeveN | Retrobution (Factory New)': 0.00,
    'Five-SeveN | Nitro (Factory New)': 0.06,
    'Five-SeveN | Hot Shot (Factory New)': 0.00,
    'P250 | Crimson Kimono (Factory New)': 0.00,
    'Tec-9 | Toxic (Factory New)': 0.00,
    'USP-S | Orion (Factory New)': 0.00,
    'USP-S | Torque (Factory New)': 0.00,
    'StatTrak™ USP-S | Torque (Factory New)': 0.00,
    'P250 | Gunsmoke (Minimal Wear)': 0.07,
    'CZ75-Auto | Yellow Jacket (Factory New)': 0.00,
    'StatTrak™ CZ75-Auto | Yellow Jacket (Factory New)': 0.00,
    'StatTrak™ CZ75-Auto | Hexane (Factory New)': 0.00,
    'CZ75-Auto | Hexane (Factory New)': 0.00,
    'CZ75-Auto | Crimson Web (Minimal Wear)': 0.07,
    'StatTrak™ CZ75-Auto | Crimson Web (Minimal Wear)': 0.07,
    'CZ75-Auto | Nitro (Minimal Wear)': 0.07,
    'Desert Eagle | Golden Koi (Factory New)': 0.00,
    'StatTrak™ Desert Eagle | Golden Koi (Factory New)': 0.00,
    'Desert Eagle | Conspiracy (Factory New)': 0.00,
    'StatTrak™ Desert Eagle | Conspiracy (Factory New)': 0.00,
    'Desert Eagle | Crimson Web (Minimal Wear)': 0.07,
    'StatTrak™ Desert Eagle | Crimson Web (Minimal Wear)': 0.07,
    'Desert Eagle | Sunset Storm 弐 (Factory New)': 0.00,
    'Desert Eagle | Blaze (Factory New)': 0.00,
    'Desert Eagle | Meteorite (Factory New)': 0.00,
    'Desert Eagle | Night (Minimal Wear)': 0.07,
    'Desert Eagle | Midnight Storm (Factory New)': 0.00,
    'Five-SeveN | Neon Kimono (Factory New)': 0.00,
    'Five-SeveN | Urban Hazard (Factory New)': 0.00,
    'StatTrak™ Five-SeveN | Urban Hazard (Factory New)': 0.00,
    'Five-SeveN | Nitro (Minimal Wear)': 0.07,
    'Five-SeveN | Candy Apple (Factory New)': 0.00,
    'Glock-18 | Water Elemental (Factory New)': 0.00,
    'StatTrak™ Glock-18 | Water Elemental (Factory New)': 0.00,
    'Glock-18 | Brass (Factory New)': 0.00,
    'Glock-18 | Candy Apple (Factory New)': 0.00,
    'Glock-18 | Night (Minimal Wear)': 0.07,
    'Glock-18 | Groundwater (Minimal Wear)': 0.07,
    'P2000 | Amber Fade (Factory New)': 0.00,
    'StatTrak™ P2000 | Handgun (Factory New)': 0.00,
    'P2000 | Handgun (Factory New)': 0.00,
    'P2000 | Scorpion (Factory New)': 0.00,
    'StatTrak™ P2000 | Imperial (Factory New)': 0.00,
    'P2000 | Imperial (Factory New)': 0.00,
    'StatTrak™ P2000 | Pulse (Factory New)': 0.00,
    'P2000 | Pulse (Factory New)': 0.00,
    'P2000 | Silver (Factory New)': 0.00,
    'P250 | Whiteout (Minimal Wear)': 0.07,
    'P250 | Contamination (Factory New)': 0.00,
    'P250 | Mint Kimono (Factory New)': 0.00,
    'StatTrak™ P250 | Undertow (Factory New)': 0.00,
    'P250 | Undertow (Factory New)': 0.00,
    'StatTrak™ P250 | Mehndi (Factory New)': 0.00,
    'P250 | Mehndi (Factory New)': 0.00,
    'P250 | Wingshot (Factory New)': 0.00,
    'StatTrak™ P250 | Wingshot (Factory New)': 0.00,
    'StatTrak™ P250 | Splash (Minimal Wear)': 0.07,
    'P250 | Splash (Minimal Wear)': 0.07,
    'Tec-9 | Nuclear Threat (Minimal Wear)': 0.07,
    'StatTrak™ Tec-9 | Isaac (Factory New)': 0.00,
    'Tec-9 | Isaac (Factory New)': 0.00,
    'Tec-9 | Sandstorm (Minimal Wear)': 0.1,
    'StatTrak™ USP-S | Orion (Factory New)': 0.00,
    'USP-S | Night Ops (Factory New)': 0.00,
    'USP-S | Para Green (Factory New)': 0.00,
    'USP-S | Kill Confirmed (Factory New)': 0.00,
    'StatTrak™ USP-S | Kill Confirmed (Factory New)': 0.00,
    'StatTrak™ Tec-9 | Sandstorm (Minimal Wear)': 0.1
};

function starify(x){
    var template = Array(34).join('*');
    var res = Math.floor(Math.abs(Math.log10(x)))
    if(res > 1)
    {
        return Array(1 + res).join(template) + ' '
    }
    return ''
}

function insert(data){
    client.connect(dburl, function(err, db){
       if(err){
           console.log('Couldn\'t connect to the database.', err);
       }
       else{
           db.collection('weapons').insertOne(data, function(err){
               if(err){
                   console.log('Couldn\'t insert ' + data.toString() + '.', err);
               }
               else{
                   console.log(starify(wepToWear[data['model']] - data['wear']) + 'Inserted a ' + data['wear'] + ' ' + data['model'] + ' at ' + data['price']  + ' to the database.');
               }
               db.close();
           });
       }
    });
}

function search(data){
    client.connect(dburl, function(err, db){
        if(err){
            console.log('Couldn\'t connect to the database.', err);
        }
        else{
            db.collection('weapons').find(data, function(err, resp){
                resp.toArray(function(err, res){
                    if(res.length)
                    {
                        res = res[0];
                        if(res['wear'] <= wepToWear[res['model']] + 0.01)
                        {
                            console.log(starify(wepToWear[res['model']] - res['wear']) + res['wear'] + ' ' + res['model'] + ' for ' + res['price'] + '. Listing ' + res['listing']);
                        }
                    }
                    else if(prices[data['id']] == parseFloat(prices[data['id']].toString())) {
                            assets.push(data['id']);
                    }
                    db.close();
                });
            });
        }
    });
}

function createSocket(){
    if(socket != undefined)
    {
        socket.disconnect();
    }

    var socket = io('https://glws.org/fuck');

    socket.on('ready', function() {
        console.log('Ready')
    });

    socket.on('status', function(status) {
        console.log(status);
    });

    socket.on('getData', function(data) {
        if(data['skin'] != undefined){
            insert({'id': data['skin']['itemid'], 'wear': data['skin']['wear_float'], 'model': names[data['skin']['itemid']], 'price': prices[data['skin']['itemid']], 'listing': listingsIDs[data['skin']['itemid']]})
        }
        else {
            console.log(data);
        }
    });
    return socket;
}

function sweepMarket(urls, listingsCount){
    if(assets.length < 100)
    {
        var res = '';
        if(urls.length == 0)
        {
            urls = createMarketLinks();
        }
        var wep = linkToWep[urls[0]];
        var url = encodeURI(urls[0].replace('%start%', listingsCount.toString()).replace('%count%', (listingsCount + 100).toString()));
        http.get(url, function(response){
            res = '';
            response.on('data', function(d){
                res += d;
            });
            response.on('end', function(){
                res = JSON.parse(res);
                Object.keys(res['listinginfo']).forEach(function(x){
                    var data = {'id': res['listinginfo'][x]['asset']['id']};
                    inspectLinks[data['id']] = res['listinginfo'][x]['asset']['market_actions'][0]['link'].replace('%listingid%', x).replace('%assetid%', res['listinginfo'][x]['asset']['id']);
                    prices[data['id']] = (res['listinginfo'][x]['converted_price_per_unit'] + res['listinginfo'][x]['converted_fee_per_unit']) / 100;
                    wears[data['id']] = wepToWear[wep];
                    names[data['id']] = wep;
                    listingsIDs[data['id']] = x;
                    search(data);
                });
                setTimeout(function(){
                    if(res['total_count'] <= 100 + listingsCount || res['total_count'] == undefined)
                    {
                        urls.shift();
                        listingsCount = -100;
                    }
                    sweepMarket(urls, listingsCount + 100);
                }, 15000);
            });
        });
    }
    else{
        setTimeout(sweepMarket, 15000, urls, listingsCount);
    }

}

function createMarketLinks() {
    var res = [];
    Object.keys(wepToWear).forEach(function (wep) {
        linkToWep[head + wep + tail] = wep;
        res.push(head + wep + tail);
    });
    return res;
}

function getInfo(){
    if(assets.length != 0) {
        var asset = assets.shift();
        socket.emit('sendData', {
                link: inspectLinks[asset]
            }
        );
        if(++count > lastReset + 400)
        {
            socket = createSocket();
            lastReset = count;
        }
    }
    setTimeout(getInfo, 1000);
}

var socket = createSocket();
sweepMarket([], 0);
getInfo();