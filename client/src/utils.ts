export function get_stage() {
  if (typeof window !== "undefined") {
    if (window?.location.href.includes("testing")) {
      return "testing";
    } else {
      return process.env.NODE_ENV as "production" | "development";
    }
  } else {
    return "testing";
  }
}

export function render_circles(hash: string) {
  if (!hash) return;
  var etherium_colors = new Array(8);
  const hashMinus0x = hash.slice(2);
  for (var i = 0; i < etherium_colors.length; i++) {
    etherium_colors[i] = "#" + hashMinus0x.substring(i * 6, i * 6 + 6);
  }

  var w = 800;
  var h = 800;

  var html = `<svg class="svg-content" width="800" height="800" viewBox="0 0 800 800" >`;
  var D = 300;
  var rs = [200, 155, 110, 61];
  var ps = [75, 75, 75, 0];
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
      ' <stop offset="100%" style="stop-color:' + end + ';stop-opacity:1" />\n';
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

  return html;
}
