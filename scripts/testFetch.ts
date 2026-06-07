import * as cheerio from "cheerio";

async function main() {
  const url = "https://vtv.vn/lich-phat-song.htm";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Log the HTML of the first 3 program items of the first ul.programs
    const firstUl = $("ul.programs").first();
    firstUl.find("li.program").slice(0, 3).each((i, el) => {
      console.log(`--- Program Item ${i} html ---`);
      console.log($.html(el));
    });
    
  } catch (err) {
    console.error(err);
  }
}

main();
