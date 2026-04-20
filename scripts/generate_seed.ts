import { physicsChapters, chemistryChapters, biologyChapters } from './src/data/syllabus';
import { kinematicsSubchapters } from './src/data/subchapters';
// Import other subchapters as needed

// This is a helper to generate SQL seeds for the new learning_nodes table
// Note: In production, we would use a more robust migration script.

const examType = 'NEET'; // Defaulting to NEET for now as per current focus

let sql = '';

function escape(str: string) {
    return str.replace(/'/g, "''");
}

const subjects = [
    { name: 'Physics', chapters: physicsChapters },
    { name: 'Chemistry', chapters: chemistryChapters },
    { name: 'Biology', chapters: biologyChapters },
];

subjects.forEach(sub => {
    const subjectId = `gen_random_uuid()`;
    sql += `-- Subject: ${sub.name}\n`;
    sql += `INSERT INTO public.learning_nodes (id, name, type, exam_type, sort_order) \n`;
    sql += `VALUES ('${sub.name.toLowerCase()}-root-uuid', '${sub.name}', 'root', '${examType}', ${subjects.indexOf(sub)}) ON CONFLICT DO NOTHING;\n\n`;

    sub.chapters.forEach((ch, chIdx) => {
        sql += `-- Chapter: ${ch.name}\n`;
        sql += `INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) \n`;
        sql += `VALUES ('${ch.id}', '${sub.name.toLowerCase()}-root-uuid', '${sub.name.toLowerCase()}-root-uuid', '${escape(ch.name)}', 'chapter', '${examType}', ${chIdx});\n`;

        // Add Topics from ch.topics
        ch.topics.forEach((topic, tIdx) => {
            const topicId = `${ch.id}-topic-${tIdx}`;
            sql += `  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) \n`;
            sql += `  VALUES ('${topicId}', '${ch.id}', '${sub.name.toLowerCase()}-root-uuid', '${escape(topic)}', 'topic', '${examType}', ${tIdx});\n`;
        });
        sql += `\n`;
    });
});

console.log(sql);
