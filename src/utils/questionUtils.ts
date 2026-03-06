export interface BaseQuestion {
    option_a?: string | null;
    option_b?: string | null;
    option_c?: string | null;
    option_d?: string | null;
    correct_option?: string;
    [key: string]: any;
}

/**
 * Shuffles the options (A, B, C, D) of a question 
 * and updates the correct_option to match the new position.
 */
export const shuffleQuestionOptions = <T extends BaseQuestion>(q: T): T => {
    if (!q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_option) {
        return q; // Skip if options are not properly formed
    }

    const options = [
        { key: 'A', text: q.option_a },
        { key: 'B', text: q.option_b },
        { key: 'C', text: q.option_c },
        { key: 'D', text: q.option_d },
    ];

    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    // Identify new correct option
    const oldCorrectKey = q.correct_option.toUpperCase();
    const correctText = q[`option_${oldCorrectKey.toLowerCase()}`];

    let newCorrectKey = 'A';
    options.forEach((opt, idx) => {
        const newKey = String.fromCharCode(65 + idx); // A, B, C, D
        if (opt.text === correctText) {
            newCorrectKey = newKey;
        }
    });

    return {
        ...q,
        option_a: options[0].text,
        option_b: options[1].text,
        option_c: options[2].text,
        option_d: options[3].text,
        correct_option: newCorrectKey,
    };
};
