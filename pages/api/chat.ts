import type { NextApiRequest, NextApiResponse } from 'next';
import { CohereEmbeddings } from "@langchain/cohere";
import { makeChain } from '@/utils/makechain';
import { COLLECTION_NAME } from '@/config/chroma';
import { Chroma } from "@langchain/community/vectorstores/chroma";

type ChatTurn = [string, string];
type SourceDocument = {
  metadata?: Record<string, any>;
};

const formatChatHistory = (history: unknown) => {
  if (!Array.isArray(history)) {
    return '';
  }

  return history
    .filter(
      (turn): turn is ChatTurn =>
        Array.isArray(turn) &&
        turn.length === 2 &&
        typeof turn[0] === 'string' &&
        typeof turn[1] === 'string',
    )
    .map(([userMessage, assistantMessage]) =>
      [`Human: ${userMessage}`, `Assistant: ${assistantMessage}`].join('\n'),
    )
    .join('\n\n');
};

const getPageNumber = (metadata: Record<string, any>) => {
  const page =
    metadata.page ??
    metadata.pageNumber ??
    metadata.loc?.pageNumber ??
    metadata.pdf?.pageNumber;

  if (typeof page === 'number') {
    return page;
  }

  if (typeof page === 'string') {
    const parsed = Number(page);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const getSources = (sourceDocuments: SourceDocument[] = []) => {
  const seen = new Set<string>();

  return sourceDocuments.flatMap((doc) => {
    const metadata = doc.metadata ?? {};
    const source = String(metadata.source ?? 'Unknown source');
    const page = getPageNumber(metadata);
    const key = `${source}:${page ?? 'unknown'}`;

    if (seen.has(key)) {
      return [];
    }

    seen.add(key);

    return [
      {
        filename: source.replace(/\\/g, '/').split('/').pop() ?? source,
        page,
        source,
      },
    ];
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  console.log('question', question);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');
  const chatHistory = formatChatHistory(history);

  try {
    /* create vectorstore*/
    const vectorStore = await Chroma.fromExistingCollection(
      new CohereEmbeddings({
        model: "embed-english-v3.0",
      }),
      {
        collectionName: COLLECTION_NAME,
      },
    );

    //create chain
    const chain = makeChain(vectorStore);
    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: chatHistory,
    });
    const sourceDocuments =
      response.sourceDocuments ?? response.source_documents ?? [];
    const sources = getSources(sourceDocuments);

    console.log('response', response);
    res.status(200).json({
      ...response,
      sourceDocuments,
      sources,
    });
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}

