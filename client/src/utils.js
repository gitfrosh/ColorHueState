// function get_etherium_colors() {
//     $.ajax({
//         url: "/state.json",
//     }).done(function (data) {
//         last_hash = data["last_hash"];
//         last_block = data["number"];
//         last_time = data["timestamp"];
//         $("#time_span").html(last_time);
//         $("#block_span").html(last_block);
//         $("#hash_span").html(
//             last_hash.substring(0, 6) +
//             "<br>" +
//             last_hash.substring(6, 12) +
//             "<br>" +
//             last_hash.substring(12, 18) +
//             "<br>" +
//             last_hash.substring(18, 24) +
//             "<br>" +
//             last_hash.substring(24, 30) +
//             "<br>" +
//             last_hash.substring(30, 36) +
//             "<br>" +
//             last_hash.substring(36, 42) +
//             "<br>" +
//             last_hash.substring(42, 48) +
//             "<br>" +
//             last_hash.substring(48, 54) +
//             "<br>" +
//             last_hash.substring(54, 60) +
//             "<br>" +
//             last_hash.substring(60, 64)
//         );
//     });
//     if (last_hash.length == "") {
//         return;
//     }
//     for (var i = 0; i < etherium_colors.length; i++) {
//         etherium_colors[i] = "#" + last_hash.substring(i * 6, i * 6 + 6);
//     }
// }


export function render_circles(last_hash) {
    if (!last_hash) return;
    var etherium_colors = new Array(8);
    for (var i = 0; i < etherium_colors.length; i++) {
        etherium_colors[i] = "#" + last_hash.substring(i * 6, i * 6 + 6);
    }
    // get_etherium_colors();
    // var canvas = document.getElementById("myCanvas");
    var w = window.innerWidth;
    var h = window.innerHeight;

    // canvas.style.width = w;
    // canvas.style.height = h;

    var diameters = [0.0, 0.25, 0.5, 0.75, 0.98];
    console.log({ diameters });

    console.log({ w, h });
    var html = '<svg height="' + h + '" width="' + w + '">\n';
    for (var i = 0; i < diameters.length - 1; i++) {
        var start = etherium_colors[i * 2];
        var end = etherium_colors[i * 2 + 1];
        //var gradientColours = coloursBetween(start, end, diameters[i+1]*m-diameters[i]*m);
        //console.log(start);
    }

    // var m = Math.floor(Math.min(w, h) / 2);
    //for (var i = 0; i < diameters.length - 1; i++) {

    var D = Math.floor(Math.min(w, h));
    D = 500;
    var rs = [200, 155, 110, 61];
    var ps = [75, 75, 75, 0];

    //for (var i = diameters.length - 2; i>=0; i--) {
    for (var i = 0; i < diameters.length - 1; i++) {
        var start = etherium_colors[i * 2];
        var end = etherium_colors[i * 2 + 1];
        html += "<defs>\n";
        html +=
            '<radialGradient id="grad' +
            i +
            '" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">\n';
        html +=
            ' <stop offset="' +
            ps[i] +
            '%" style="stop-color:' +
            start +
            ';stop-opacity:1" />\n';
        html +=
            ' <stop offset="100%" style="stop-color:' +
            end +
            ';stop-opacity:1" />\n';
        html += "</radialGradient>\n";
        html += "</defs>\n";
        html +=
            '<ellipse cx="' +
            w / 2 +
            '" cy="' +
            h / 2 +
            '" rx="' +
            (D * rs[i]) / 200 / 1.5 +
            '" ry="' +
            (D * rs[i]) / 200 / 1.5 +
            '" fill="url(#grad' +
            i +
            ')" />\n';
        //html += '</svg>';
    }
    html += "</svg>\n";
    console.log(html);

    return html;
    // canvas.innerHTML = html;
    // $("#info_div").css("visibility", "hidden");
}