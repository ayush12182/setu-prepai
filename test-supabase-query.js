import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://osbpdjlywgydidzurpsb.supabase.co';
const supabaseKey = 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Testing Supabase connection and query...");
  
  // Test simple select
  try {
    const { data: testData, error: testError, count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });
      
    if (testError) {
      console.error("Test count error:", testError);
    } else {
      console.log("Test count success. Exact count of rows in questions:", count);
    }

    const { data: pdfData, error: pdfError } = await supabase
      .from('questions')
      .select('*, pdf_sources(*)')
      .limit(1);
    if (pdfError) {
      console.error("pdf_sources query error (with relation):", pdfError);
    } else {
      console.log("pdf_sources query succeeded (with relation). Rows:", pdfData.length);
    }

    const { data: bankData, error: bankError, count: bankCount } = await supabase
      .from('questions_bank')
      .select('*', { count: 'exact', head: true });
      
    if (bankError) {
      console.error("questions_bank count error:", bankError);
    } else {
      console.log("questions_bank count success. Exact count of rows in questions_bank:", bankCount);
    }
  } catch (err) {
    console.error("Exception during count:", err);
  }

  // Test standard query with double quotes
  const nodeId = 'ch-units';
  const topicName = 'Units and Measurements';
  const examTypes = ['JEE_MAINS', 'JEE_ADVANCED'];
  
  console.log("Testing query with double quotes in .or()...");
  try {
    const { data: dbData, error: dbError } = await supabase
      .from('questions')
      .select('*')
      .eq('verification_status', 'APPROVED')
      .in('exam_type', examTypes)
      .or(`chapter_id.eq."${nodeId}",subchapter_id.eq."${nodeId}",concept_tested.eq."${topicName}"`);

    if (dbError) {
      console.error("Query with double quotes failed:", dbError);
    } else {
      console.log("Query with double quotes succeeded. Rows fetched:", dbData ? dbData.length : 0);
    }
  } catch (err) {
    console.error("Exception during double quoted query:", err);
  }
  
  // Test query WITHOUT double quotes
  console.log("Testing query WITHOUT double quotes in .or()...");
  try {
    const { data: dbData2, error: dbError2 } = await supabase
      .from('questions')
      .select('*')
      .eq('verification_status', 'APPROVED')
      .in('exam_type', examTypes)
      .or(`chapter_id.eq.${nodeId},subchapter_id.eq.${nodeId},concept_tested.eq.${topicName}`);

    if (dbError2) {
      console.error("Query WITHOUT double quotes failed:", dbError2);
    } else {
      console.log("Query WITHOUT double quotes succeeded. Rows fetched:", dbData2 ? dbData2.length : 0);
    }
  } catch (err) {
    console.error("Exception during unquoted query:", err);
  }
}

run();
