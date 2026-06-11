import { readdirSync } from 'fs';
import { join, extname } from 'path';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { CohereEmbeddings } from '@langchain/cohere';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { COHERE_API_KEY } from '@/config/cohere';
import { COLLECTION_NAME } from '@/config/chroma';

/* Name of directory to retrieve your files from */
const filePath = 'docs';

/** Recursively collect all .pdf file paths under a directory */
function getPdfPaths(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return getPdfPaths(fullPath);
    if (entry.isFile() && extname(entry.name).toLowerCase() === '.pdf') return [fullPath];
    return [];
  });
}

export const run = async () => {
  try {
    /* Load raw docs from all PDF files in the directory */
    const pdfPaths = getPdfPaths(filePath);
    console.log(`Found ${pdfPaths.length} PDF file(s):`, pdfPaths);

    const rawDocs = (
      await Promise.all(
        pdfPaths.map(async (p) => {
          const loader = new CustomPDFLoader(p);
          return loader.load();
        })
      )
    ).flat();

    console.log(`Loaded ${rawDocs.length} document(s)`);

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log(`Split into ${docs.length} chunk(s)`);

    console.log('Creating vector store...');

    /* Create embeddings */
    const embeddings = new CohereEmbeddings({
      model: 'embed-english-v3.0',
      apiKey: COHERE_API_KEY, // In Node.js defaults to process.env.COHERE_API_KEY
      batchSize: 48, // Default value if omitted is 48. Max value is 96
    });

    /* Delete existing collection if it exists, then recreate fresh */
    try {
      const { ChromaClient } = await import('chromadb');
      const client = new ChromaClient();
      await client.deleteCollection({ name: COLLECTION_NAME });
      console.log(`Deleted existing collection: ${COLLECTION_NAME}`);
    } catch {
      // Collection didn't exist yet — that's fine
    }

    /* Ingest documents in batches of 100 */
    const totalBatches = Math.ceil(docs.length / 100);
    for (let i = 0; i < docs.length; i += 100) {
      const batch = docs.slice(i, i + 100);
      await Chroma.fromDocuments(batch, embeddings, {
        collectionName: COLLECTION_NAME,
      });
      console.log(`Ingested batch ${Math.floor(i / 100) + 1} of ${totalBatches}`);
    }
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('Ingestion of documents complete');
})();
