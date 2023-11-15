import { SlashCommandBuilder } from "discord.js";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { retrieveText } from "../../utils/retrieveText";
import { getNews } from "../../utils/retrieveData";
import { generateAndStoreEmbeddings } from "../../utils/storeEmbeddings";

function isURL(str: string): boolean {
    var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
            "(\\#[-a-z\\d_]*)?$",
        "i"
    ); // fragment locator
    return pattern.test(str);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("weeklynews")
        .setDescription("Set your weekly news topic!")
        .addStringOption((option: any) =>
            option
                .setName("topic")
                .setDescription("The news topic you want to set")
                .setRequired(true)
                .setMinLength(3)
        )
        .addStringOption((option: any) =>
            option
                .setName("optional-website")
                .setDescription(
                    "The news website you want to gather information from"
                )
                .setRequired(false)
        ),
    async execute(interaction: any) {
        console.log("weeklynews command executed");
        const topic: string = interaction.options.getString("topic");
        const website: string | null =
            interaction.options.getString("optional-website");
        if (website && !isURL(website)) {
            await interaction.reply(
                "Sorry, the website you provided is not a valid URL!"
            );
            return;
        }

        await getNews(topic, website);
        await generateAndStoreEmbeddings();

        const [transcript, message]: [string | null, string | null] =
            await retrieveText(topic);

        if (!transcript || !message) {
            await interaction.reply(
                "Sorry, there was an error while generating your weekly news!"
            );
            return;
        }
        console.log(`transcript: ${transcript}`);
        console.log(`message: ${message}`);

        await interaction.reply(message);
    },
};
