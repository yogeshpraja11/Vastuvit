const https = require('https');

https.get('https://cdn.prod.website-files.com/685284771a3175da27f67ba1/css/felixnieto-dev.webflow.shared.5a0afbf0e.min.css', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const fonts = [...new Set(data.match(/font-family:[^;}]+/g) || [])];
    const hexes = [...new Set(data.match(/#[0-9a-fA-F]{3,6}/g) || [])];
    const themeVars = [...new Set(data.match(/--_theme[^:]*:\s*(#[0-9a-fA-F]{3,6}|rgba?[^)]+\)|[a-z]+)/gi) || [])];
    const otherColors = [...new Set(data.match(/--color[^:]*:\s*(#[0-9a-fA-F]{3,6}|rgba?[^)]+\)|[a-z]+)/gi) || [])];
    
    console.log("FONTS:");
    console.log(fonts.join('\n'));
    console.log("\nTHEME VARS:");
    console.log(themeVars.join('\n'));
    console.log("\nCOLOR VARS:");
    console.log(otherColors.join('\n'));
  });
});
