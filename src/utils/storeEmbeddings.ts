import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/splitter/recursive_character";
import { HNSWLib } from "langchain/vector_store/hnswlib";
import fs from "fs";
import { config } from "../config";

const OPENAI_API_KEY = config.OPENAI_KEY;

export async function generateAndStoreEmbeddings() {
    // Load the data
    const trainingText_News = fs.readFileSync("training-data-news.txt", "utf8");
    const trainingText_Announcer = fs.readFileSync(
        "training-data-announcer.txt",
        "utf8"
    );

    // Split the data into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
    });

    // Generate embeddings from documents
    const docs = await textSplitter.createDocuments([
        trainingText_News,
        trainingText_Announcer,
    ]);

    // Store the embeddings in a vector store
    const vectorStore = await HNSWLib.fromDocuments(
        docs,
        new OpenAIEmbeddings({ openAIApiKey: config.OPENAI_KEY })
    );

    // Save the vector store
    vectorStore.save("hnswlib");
}
