import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { RetrievalQAChain, loadQARefineChain } from "langchain/chains";
import { config } from "../config";

const model = new OpenAI({
    openAIApiKey: config.OPENAI_KEY,
    temperature: 0.9,
    modelName: "gpt-4-1106-preview",
});

export async function retrieveText(
    topic: string
): Promise<[string | null, string | null]> {
    // Load the vector store
    const vectorStore = await HNSWLib.load(
        "hnswlib",
        new OpenAIEmbeddings({ openAIApiKey: config.OPENAI_KEY })
    );
    if (!vectorStore) {
        console.log("Error loading vector store");
        return [null, null];
    }

    // Create the chain
    const chain = new RetrievalQAChain({
        combineDocumentsChain: loadQARefineChain(model),
        retriever: vectorStore.asRetriever(),
    });
    if (!chain) {
        console.log("Error creating chain");
        return [null, null];
    }

    // Get the answer
    const transcript = await chain.call({
        query:
            "You are Realistic Fish Head News Anchor from SpongeBob and you are reporting on the topic of " +
            topic +
            ".        ",
    });
    if (!transcript.output_text) {
        console.log("Error generating transcript");
        return [null, null];
    }

    const message = await chain.call({
        query:
            "Write a discord news announcement with engaging formatting and emojis but not too over the top based on this text" +
            transcript.output_text,
    });
    if (!message.output_text) {
        console.log("Error generating message");
        return [null, null];
    }

    return [transcript.output_text, message.output_text];
}
