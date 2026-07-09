export interface BaseQuestion {
    option_a?: string | null;
    option_b?: string | null;
    option_c?: string | null;
    option_d?: string | null;
    correct_option?: string;
    [key: string]: unknown;
}

/**
 * Shuffles the options (A, B, C, D) of a question 
 * and updates the correct_option/answer to match the new position.
 */
export const shuffleQuestionOptions = <T extends BaseQuestion>(q: T): T => {
    // Standardize correct answer key
    const correctOpt = ((q.correct_option || q.answer || 'A') as string).toUpperCase();
    
    // Support option_a/b/c/d or options.A/B/C/D
    const optA = q.option_a || (q.options as any)?.A;
    const optB = q.option_b || (q.options as any)?.B;
    const optC = q.option_c || (q.options as any)?.C;
    const optD = q.option_d || (q.options as any)?.D;

    if (!optA || !optB || !optC || !optD || !correctOpt) {
        return q; // Skip if options are not properly formed
    }

    const options = [
        { key: 'A', text: optA },
        { key: 'B', text: optB },
        { key: 'C', text: optC },
        { key: 'D', text: optD },
    ];

    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    // Find the text of the old correct option
    let correctText = '';
    if (correctOpt === 'A') correctText = optA;
    else if (correctOpt === 'B') correctText = optB;
    else if (correctOpt === 'C') correctText = optC;
    else if (correctOpt === 'D') correctText = optD;

    let newCorrectKey = 'A';
    options.forEach((opt, idx) => {
        const newKey = String.fromCharCode(65 + idx); // A, B, C, D
        if (opt.text === correctText) {
            newCorrectKey = newKey;
        }
    });

    const updated: any = {
        ...q,
        option_a: options[0].text,
        option_b: options[1].text,
        option_c: options[2].text,
        option_d: options[3].text,
    };

    if (q.correct_option !== undefined) {
        updated.correct_option = newCorrectKey;
    }
    if (q.answer !== undefined) {
        updated.answer = newCorrectKey;
    }
    if (q.options !== undefined || (q.options as any)) {
        updated.options = {
            A: options[0].text,
            B: options[1].text,
            C: options[2].text,
            D: options[3].text,
        };
    }

    return updated as T;
};

