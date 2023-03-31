

export function render_circles(last_hash) {
    if (!last_hash) return;
    var etherium_colors = new Array(8);
    for (var i = 0; i < etherium_colors.length; i++) {

        etherium_colors[i] = "#" + last_hash.substring(i * 6, i * 6 + 6);
        console.log(etherium_colors[i])
    }

    var w = 700;
    var h = 700;

    // var diameters = [0.0, 0.25, 0.5, 0.75, 0.98];

    var html = `<svg  viewbox="0 0 700 700">`;
    // for (var i = 0; i < diameters.length - 1; i++) {
    //     var start = etherium_colors[i * 2];
    //     var end = etherium_colors[i * 2 + 1];
    //     console.log(start, end)

    // }
    // var D = Math.floor(Math.min(w, h));
    var D = 400;
    var rs = [200, 155, 110, 61];
    var ps = [75, 75, 75, 0];
    console.log({ D })
    console.log({ w, h })
    for (var i = 0; i < 5 - 1; i++) {
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
    }
    html += "</svg>\n";
    // console.log(html);

    return html;
    // canvas.innerHTML = html;
    // $("#info_div").css("visibility", "hidden");
}