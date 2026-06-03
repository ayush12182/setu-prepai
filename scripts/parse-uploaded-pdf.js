#!/usr/bin/env node
/**
 * PrepEntrance PDF Question Paper Parser
 * ──────────────────────────────────────
 * Lists PDFs uploaded to Supabase Storage in the 'question-papers' bucket,
 * extracts their text contents using pdf-parse, and invokes the Deno edge
 * function 'parse-questions-ai' to parse questions into the database.
 *
 * Usage:
 *   node scripts/parse-uploaded-pdf.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import pdf from 'pdf-parse';
import readline from 'readline';

// Fallback production credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osbpdjlywgydidzurpsb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n================================================');
  console.log('PrepEntrance PDF Question Paper Ingestion Tool');
  console.log('================================================\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Fetch files in 'question-papers' bucket
  console.log('Fetching files from storage bucket "question-papers"...');
  const { data: files, error: storageError } = await supabase.storage
    .from('question-papers')
    .list();

  if (storageError) {
    console.error('Error fetching bucket files:', storageError.message);
    process.exit(1);
  }

  // Filter out folders and empty names
  const pdfFiles = files.filter(f => f.name && !f.name.startsWith('.'));

  if (pdfFiles.length === 0) {
    console.log('No files found in the "question-papers" bucket.');
    console.log('Please upload a PDF file to the bucket first and try again.');
    process.exit(0);
  }

  console.log('\nFound files in bucket:');
  pdfFiles.forEach((file, index) => {
    const sizeMB = (file.metadata?.size / (1024 * 1024)).toFixed(2);
    console.log(`[${index + 1}] ${file.name} (${sizeMB} MB) - Uploaded: ${new Date(file.created_at).toLocaleString()}`);
  });

  const selectedIndexStr = await askQuestion('\nEnter the number of the PDF file to process: ');
  const selectedIndex = parseInt(selectedIndexStr, 10) - 1;

  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= pdfFiles.length) {
    console.error('Invalid selection. Exiting.');
    process.exit(1);
  }

  const selectedFile = pdfFiles[selectedIndex];
  console.log(`\nSelected: "${selectedFile.name}"`);

  // Prompt for metadata
  const exam = await askQuestion('Enter target Exam (JEE_MAINS / NEET / CUET) [default: JEE_MAINS]: ') || 'JEE_MAINS';
  const subject = await askQuestion('Enter Subject (Physics / Chemistry / Maths / Biology) [default: Physics]: ') || 'Physics';
  const userClass = await askQuestion('Enter Class (11 / 12 / dropper) [default: 12]: ') || '12';

  // 2. Download file
  console.log(`\nDownloading file "${selectedFile.name}"...`);
  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from('question-papers')
    .download(selectedFile.name);

  if (downloadError) {
    console.error('Download failed:', downloadError.message);
    process.exit(1);
  }

  // 3. Extract text
  console.log('Extracting text content from PDF...');
  const arrayBuffer = await fileBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  let extractedText = '';
  try {
    const pdfData = await pdf(buffer);
    extractedText = pdfData.text;
    console.log(`Successfully extracted ${extractedText.length} characters of text.`);
  } catch (parseError) {
    console.error('PDF text extraction failed:', parseError.message);
    process.exit(1);
  }

  if (!extractedText.trim()) {
    console.error('Extracted text is empty. PDF might be scanned/image-only.');
    process.exit(1);
  }

  // Preview text snippet
  console.log('\n--- Text Preview ---');
  console.log(extractedText.slice(0, 500) + '...\n--------------------');

  const confirmParse = await askQuestion('Send text to Claude AI edge function to parse questions? (y/n): ');
  if (confirmParse.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    process.exit(0);
  }

  // 4. Send to Deno edge function
  console.log('\nSending text payload to "parse-questions-ai" Edge Function...');
  try {
    const { data: resData, error: edgeError } = await supabase.functions.invoke('parse-questions-ai', {
      body: {
        rawText: extractedText,
        source: 'PDF_UPLOAD',
        exam,
        subject,
        userClass
      }
    });

    if (edgeError) {
      throw new Error(edgeError.message || JSON.stringify(edgeError));
    }

    console.log('\n================================================');
    console.log(`Success! Parsed & inserted ${resData.count} questions.`);
    console.log('================================================\n');
    console.log('Database verification details:');
    console.log(resData.data.map(q => `- [ID: ${q.id}] Difficulty: ${q.difficulty} | Chapter: ${q.chapter} | Q: ${q.question_text.slice(0, 60)}...`).join('\n'));

  } catch (err) {
    console.error('\nEdge Function execution failed:', err.message);
  } finally {
    rl.close();
  }
}

main().catch(err => {
  console.error('Unhandled script error:', err);
  process.exit(1);
});
