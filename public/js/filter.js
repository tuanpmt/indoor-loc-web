init();
const txPw = 7;
function dist(rssi) {
    /*
     * RSSI = TxPower - 10 * n * lg(d)
     * n = 2 (in free space)
     * 
     * d = 10 ^ ((TxPower - RSSI) / (10 * n))
     */
 
    return Math.pow(10, (txPw - rssi) / (10 * 2));
}


function filter_dist(last, rssi) {
    var d = dist(rssi), a;
    if(last.xhat == -1) {
        last.xhat = d;
        return d;
    }
    last.p += last.q;
    a = last.p + last.r;
    var e = last.p / (a - last.p);
    var g = e*a - e*last.p;
    last.p = (1 - g) * last.p;
    last.xhat = last.xhat + g*(d - last.xhat);
    return last.xhat;
}
function init() {
    const limit_length = 100;
    var dataset = [];
    var x = 0;

    var socket = io('http://localhost:8080');

    socket.on('news', function(data) {
        console.log(data);
    });

    socket.on('scan', function(data) {
        var decodedString = String.fromCharCode.apply(null, new Uint8Array(data));
        var obj = JSON.parse(decodedString);
        update(chart, obj);
        console.log(obj.name, obj.rssi, dist(obj.rssi, txPw));

    });

    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: [],
            datasets: []
        },

        // Configuration options go here
        options: {
            responsive: true,
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: -40,
                        suggestedMax: -10
                    }
                }]
            },
            // elements: {
            //        line: {
            //            tension: 0, // disables bezier curves
            //        }
            //    }
        }
    });

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }


    function update(chart, obj) {
        // {
        //     label: "My First dataset",
        //     data: [1, 2, 3, 4, 5, 6],
        // }
        
        
        if (chart.data.labels.length > limit_length) {
            // chart.data.labels = 
            chart.data.labels.splice(0, 1);
        }
        chart.data.labels.push(x++);

        var found = null, filter = null;
        for (var i = 0; i < chart.data.datasets.length; i++) {
            
            if (chart.data.datasets[i].label == obj.name) {
                while (chart.data.datasets[i].data.length > limit_length) {
                    // chart.data.datasets[i].data = 
                    console.log(i, chart.data.datasets)
                    chart.data.datasets[i].data.splice(0, 1);
                    chart.data.datasets[i+1].data.splice(0, 1);
                }
                found = chart.data.datasets[i];
                filter = chart.data.datasets[i + 1]
                break;
            }
        }
        document.getElementById('current_dist').innerHTML = obj.distf;
        if (found) {

            found.data.push(obj.dist);
            filter.data.push(obj.distf);
        } else {
            // var xhat = -1, p = 1, r = 0.1, q = .01;
            chart.data.datasets.push({ 
                label: obj.name, 
                data: [obj.dist], 
                fill: false, 
                borderColor: getRandomColor() 
            });
            var fval = { xhat: -1, p: 1, r: 0.1, q: 0.01 };
            chart.data.datasets.push({ 
                label: obj.name + '_FILTER', 
                data: [obj.distf], 
                fill: false, 
                borderColor: getRandomColor(),
                f: fval
            });
        }
        chart.update();
    }
}