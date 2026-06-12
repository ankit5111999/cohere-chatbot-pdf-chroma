# RAG Chatbot Answer Quality Evaluation

This evaluation is designed for the default PDF content in `docs/` and for any newly uploaded PDFs after ingestion.

Note: These questions were prepared for systematic testing, but live chatbot answers were not generated in this environment because local runtime/container verification is restricted. Fill the "Actual Answer" and "Score" columns after running the app locally.

## Scoring Rubric

| Score | Meaning |
| --- | --- |
| 5 | Correct, grounded, concise, and cites the right source. |
| 4 | Mostly correct with minor missing detail or weak citation. |
| 3 | Partly correct but incomplete, vague, or lightly ungrounded. |
| 2 | Mostly incorrect or fails to use retrieved context well. |
| 1 | Incorrect, hallucinated, or answers out-of-scope content as fact. |

## Evaluation Table

| # | Question | Expected Answer (short) | Actual Answer (short) | Score 1-5 |
| --- | --- | --- | --- | --- |
| 1 | Who is the author of the uploaded novel? | George R. R. Martin. | Not run in this environment. | N/A |
| 2 | Why does Eddard Stark agree to go south with King Robert? | Robert asks Ned to serve as Hand of the King after Jon Arryn's death. | Not run in this environment. | N/A |
| 3 | What happens to Bran after he climbs the tower? | Bran sees Jaime and Cersei together, and Jaime pushes him from the tower. | Not run in this environment. | N/A |
| 4 | What is the significance of the direwolf pups found by the Starks? | They match House Stark's sigil and are given to the Stark children. | Not run in this environment. | N/A |
| 5 | Name two early signs of tension between the Starks and Lannisters. | Examples: Jon Arryn's suspicious death, Lannister secrecy, Jaime/Cersei incident, conflict around Bran. | Not run in this environment. | N/A |
| 6 | Follow-up test: Tell me more about the second point. | The answer should refer back to the second point from the previous answer, not treat the question independently. | Not run in this environment. | N/A |
| 7 | Out-of-scope test: What is the best way to bake sourdough bread? | The chatbot should say the question is outside the document context. | Not run in this environment. | N/A |

## Average Score

Average score: N/A until live answers are collected.

Formula:

```text
average = total score / number of scored questions
```

## Reflection Questions

**What type of questions scored lowest?**

Usually, follow-up questions, ambiguous references, and broad summary questions score lowest because they depend heavily on conversation memory and retrieval quality.

**How would changing chunk size or overlap affect these results?**

Larger chunks can preserve more surrounding context but may retrieve less precisely; higher overlap can improve continuity across chunk boundaries but increases storage size and duplicate retrieval risk.

**What would be the business impact if this chatbot were deployed to real users?**

If answer quality is inconsistent, users may lose trust quickly, especially when the chatbot gives confident but poorly grounded answers; source citations reduce that risk by making answers easier to verify.

## Recommended Local Test Steps

1. Start Chroma with persistent storage.
2. Run ingestion once.
3. Start the Next.js app.
4. Ask each evaluation question in order.
5. Copy each chatbot answer into the table.
6. Score each answer using the rubric.
7. Calculate the average score.
