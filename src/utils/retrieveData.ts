import fetch from "node-fetch";
import fs from "fs";
import { convert } from "html-to-text";
import { config } from "../config";

export async function convertURLtoText(url: string) {
    const text = await fetch(url).then(async (resp) => {
        let text: string = await resp.text();
        let textNoHTML: string = convert(text);
        return textNoHTML;
    });
    return text;
}

export async function getNews(query: string, website: string | null) {
    let url = `https://www.googleapis.com/customsearch/v1?key=${
        config.CUSTOM_SEARCH_KEY
    }&cx=${config.SEARCH_ENGINE_ID}&q=${encodeURIComponent(
        query
    )}&dateRestrict=d7`;
    let resp = await fetch(url);
    let data: any = await resp.json();
    const writeFilePromises = data.items.map((item: any) => {
        let url: string = item.link;
        convertURLtoText(url).then((text: any) => {
            fs.writeFile(
                "./training-data-news.txt",
                text,
                { flag: "w" },
                () => {
                    console.log("Wrote news training data to file");
                }
            );
        });
    });
    if (website) {
        convertURLtoText(website).then((text: any) => {
            fs.writeFile(
                "./training-data-news.txt",
                text,
                { flag: "a" },
                () => {
                    console.log("Appended news training data to file");
                }
            );
        });
    }

    await Promise.all(writeFilePromises);
}
