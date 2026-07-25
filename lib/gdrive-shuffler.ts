import crypto from 'crypto';

// Secret key for HMAC token signing (falls back to secure environment value)
const TOKEN_SECRET_KEY = process.env.TOKEN_SECRET_KEY || 'bsprep-gamified-secret-key-32-bytes!';

export interface OptionPayload {
  optionId: string;       // Anonymized transient UUID
  type: 'image' | 'text';
  content: string;        // Proxy URL or text content
}

export interface QuestionPayload {
  questionFolderId: string;
  questionNumber: number;
  questionContent: { type: 'image' | 'text'; content: string };
  options: OptionPayload[];
  questionToken: string;  // Tamper-proof HMAC signature encoding correct optionId
}

export interface ExamHierarchyQuery {
  academicLevel: 'Foundation' | 'Diploma' | 'Degree';
  examType: 'Quiz 1' | 'Quiz 2' | 'End Term';
  dateShift: string;
}

/**
 * High-performance Fisher-Yates shuffle for array randomisation
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates an HMAC-SHA256 token encoding the question folder & correct option ID
 */
export function generateQuestionToken(questionFolderId: string, correctOptionId: string): string {
  const payload = `${questionFolderId}:${correctOptionId}`;
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET_KEY).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ questionFolderId, correctOptionId, hmac })).toString('base64');
}

/**
 * Securely validates a user's selected option against the signed HMAC token
 */
export function validateQuestionAnswer(questionToken: string, selectedOptionId: string): { isValid: boolean; isCorrect: boolean } {
  try {
    const decodedRaw = Buffer.from(questionToken, 'base64').toString('utf-8');
    const decoded = JSON.parse(decodedRaw);
    const { questionFolderId, correctOptionId, hmac } = decoded;

    if (!questionFolderId || !correctOptionId || !hmac) {
      return { isValid: false, isCorrect: false };
    }

    // Verify HMAC signature to prevent client-side tampering
    const expectedHmac = crypto.createHmac('sha256', TOKEN_SECRET_KEY)
      .update(`${questionFolderId}:${correctOptionId}`)
      .digest('hex');

    if (hmac !== expectedHmac) {
      return { isValid: false, isCorrect: false };
    }

    const isCorrect = selectedOptionId === correctOptionId;
    return { isValid: true, isCorrect };
  } catch (error) {
    return { isValid: false, isCorrect: false };
  }
}

/**
 * Option Shuffler Processor: Transforms raw 4 options where Option 2 is ALWAYS correct into randomized payload
 */
export function processQuestionOptionsAndShuffle(
  questionFolderId: string,
  questionNumber: number,
  questionMediaUrlOrText: { type: 'image' | 'text'; content: string },
  rawOptions: Array<{ originalName: string; content: string; type: 'image' | 'text' }>
): QuestionPayload {
  // Identify Option 2 (The Secret Correct Option rule)
  // Search for Option 2 by file/item name conventions (e.g., 'option 2', 'opt2', 'option2')
  let correctIndex = rawOptions.findIndex(o => 
    o.originalName.toLowerCase().includes('option 2') || 
    o.originalName.toLowerCase().includes('option2') || 
    o.originalName.toLowerCase().includes('opt2')
  );

  // If index not found by string pattern, fallback to index 1 (0-indexed second element)
  if (correctIndex === -1 && rawOptions.length >= 2) {
    correctIndex = 1;
  }

  let correctOptionId = '';
  const sanitizedOptions: OptionPayload[] = [];

  rawOptions.forEach((opt, idx) => {
    const optionId = `opt_${crypto.randomUUID()}`;
    if (idx === correctIndex) {
      correctOptionId = optionId;
    }

    sanitizedOptions.push({
      optionId,
      type: opt.type,
      content: opt.content,
    });
  });

  // Execute Fisher-Yates Shuffling on the sanitized options array
  const shuffledOptions = shuffleArray(sanitizedOptions);

  // Generate secure tamper-proof question token
  const questionToken = generateQuestionToken(questionFolderId, correctOptionId);

  return {
    questionFolderId,
    questionNumber,
    questionContent: questionMediaUrlOrText,
    options: shuffledOptions,
    questionToken,
  };
}

/**
 * Fetches & Traverses Google Drive Folder Hierarchy OR returns realistic sample exam dataset if drive API key is unconfigured.
 */
export async function fetchExamQuestionsFromDrive(query: ExamHierarchyQuery): Promise<QuestionPayload[]> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  if (apiKey && rootFolderId) {
    try {
      // 1. Fetch Level folder
      const levelFolderId = await queryDriveFolderByName(rootFolderId, query.academicLevel, apiKey);
      // 2. Fetch Exam folder
      const examFolderId = await queryDriveFolderByName(levelFolderId, query.examType, apiKey);
      // 3. Fetch Date/Shift folder
      const dateShiftFolderId = await queryDriveFolderByName(examFolderId, query.dateShift, apiKey);
      // 4. Fetch Question folders
      const questionFolders = await listDriveSubfolders(dateShiftFolderId, apiKey);

      const questions: QuestionPayload[] = [];
      let qNum = 1;

      for (const qFolder of questionFolders) {
        const files = await listDriveFiles(qFolder.id, apiKey);
        
        // Find question file and 4 option files
        const questionFile = files.find(f => f.name.toLowerCase().includes('question') || f.name.toLowerCase().startsWith('q'));
        const opt1File = files.find(f => f.name.toLowerCase().includes('option 1') || f.name.toLowerCase().includes('opt1'));
        const opt2File = files.find(f => f.name.toLowerCase().includes('option 2') || f.name.toLowerCase().includes('opt2')); // ALWAYS CORRECT
        const opt3File = files.find(f => f.name.toLowerCase().includes('option 3') || f.name.toLowerCase().includes('opt3'));
        const opt4File = files.find(f => f.name.toLowerCase().includes('option 4') || f.name.toLowerCase().includes('opt4'));

        const rawOpts = [
          { originalName: opt1File?.name || 'Option 1', content: `/api/quiz-prep/media?fileId=${opt1File?.id || 'demo1'}`, type: 'image' as const },
          { originalName: opt2File?.name || 'Option 2', content: `/api/quiz-prep/media?fileId=${opt2File?.id || 'demo2'}`, type: 'image' as const }, // Correct!
          { originalName: opt3File?.name || 'Option 3', content: `/api/quiz-prep/media?fileId=${opt3File?.id || 'demo3'}`, type: 'image' as const },
          { originalName: opt4File?.name || 'Option 4', content: `/api/quiz-prep/media?fileId=${opt4File?.id || 'demo4'}`, type: 'image' as const },
        ];

        const payload = processQuestionOptionsAndShuffle(
          qFolder.id,
          qNum++,
          { type: 'image', content: `/api/quiz-prep/media?fileId=${questionFile?.id || files[0]?.id || 'demo_q'}` },
          rawOpts
        );

        questions.push(payload);
      }

      if (questions.length > 0) return questions;
    } catch (e) {
      console.warn('Google Drive API fetch failed or missing folders, falling back to dynamic sample generator:', e);
    }
  }

  // Graceful Fallback Dynamic Generator (For testing and immediate demo out of the box)
  return generateMockExamQuestions(query);
}

// Drive API Helper Functions
async function queryDriveFolderByName(parentId: string, folderName: string, apiKey: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files?q='${parentId}'+in+parents+and+name='${encodeURIComponent(folderName)}'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.files?.[0]) throw new Error(`Folder ${folderName} not found in parent ${parentId}`);
  return data.files[0].id;
}

async function listDriveSubfolders(parentId: string, apiKey: string): Promise<Array<{ id: string; name: string }>> {
  const url = `https://www.googleapis.com/drive/v3/files?q='${parentId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files || [];
}

async function listDriveFiles(parentId: string, apiKey: string): Promise<Array<{ id: string; name: string; mimeType: string }>> {
  const url = `https://www.googleapis.com/drive/v3/files?q='${parentId}'+in+parents+and+trashed=false&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files || [];
}

/**
 * Fallback Mock Data Generator ensuring Option 2 is mapped and shuffled correctly for demo/testing
 */
function generateMockExamQuestions(query: ExamHierarchyQuery): QuestionPayload[] {
  const mockQuestionsList = [
    {
      qId: 'q_folder_101',
      question: `[${query.academicLevel} - ${query.examType}] Let f: R -> R be defined by f(x) = x^2 + 4x + 5. What is the minimum value of f(x)?`,
      options: [
        { originalName: 'Option 1.txt', content: 'Minimum value is 5 at x = 0', type: 'text' as const },
        { originalName: 'Option 2.txt', content: 'Minimum value is 1 at x = -2', type: 'text' as const }, // ALWAYS CORRECT
        { originalName: 'Option 3.txt', content: 'Minimum value is -1 at x = 2', type: 'text' as const },
        { originalName: 'Option 4.txt', content: 'Minimum value is 0 at x = -4', type: 'text' as const },
      ]
    },
    {
      qId: 'q_folder_102',
      question: `[${query.academicLevel} - ${query.examType}] In Python, which of the following operations has a time complexity of O(1) for a standard list?`,
      options: [
        { originalName: 'Option 1.txt', content: 'list.insert(0, element)', type: 'text' as const },
        { originalName: 'Option 2.txt', content: 'list.pop() [removes last element]', type: 'text' as const }, // ALWAYS CORRECT
        { originalName: 'Option 3.txt', content: 'element in list [linear search]', type: 'text' as const },
        { originalName: 'Option 4.txt', content: 'list.remove(element)', type: 'text' as const },
      ]
    },
    {
      qId: 'q_folder_103',
      question: `[${query.academicLevel} - ${query.examType}] If two events A and B are independent with P(A) = 0.4 and P(B) = 0.5, what is P(A U B)?`,
      options: [
        { originalName: 'Option 1.txt', content: 'P(A U B) = 0.90', type: 'text' as const },
        { originalName: 'Option 2.txt', content: 'P(A U B) = 0.70', type: 'text' as const }, // ALWAYS CORRECT: 0.4 + 0.5 - 0.20 = 0.70
        { originalName: 'Option 3.txt', content: 'P(A U B) = 0.20', type: 'text' as const },
        { originalName: 'Option 4.txt', content: 'P(A U B) = 0.60', type: 'text' as const },
      ]
    },
    {
      qId: 'q_folder_104',
      question: `[${query.academicLevel} - ${query.examType}] Which grammatical structure correctly fixes the dangling modifier in: "Walking through the library, the books looked fascinating."`,
      options: [
        { originalName: 'Option 1.txt', content: 'Walking through the library, fascinating books were seen by me.', type: 'text' as const },
        { originalName: 'Option 2.txt', content: 'As I walked through the library, the books looked fascinating.', type: 'text' as const }, // ALWAYS CORRECT
        { originalName: 'Option 3.txt', content: 'The books looked fascinating walking through the library.', type: 'text' as const },
        { originalName: 'Option 4.txt', content: 'Walking through the library, the books were fascinating to look at.', type: 'text' as const },
      ]
    }
  ];

  return mockQuestionsList.map((item, idx) => 
    processQuestionOptionsAndShuffle(
      item.qId,
      idx + 1,
      { type: 'text', content: item.question },
      item.options
    )
  );
}
