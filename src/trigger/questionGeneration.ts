import { task } from "@trigger.dev/sdk/v3";
import { supabase } from "@/integrations/supabase/client";

export const generateQuestionsBatch = task({
  id: "generate-questions-batch",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000 * 10,
  },
  run: async (payload: { jobId: string; chunkSize?: number }, { ctx }) => {
    const { jobId, chunkSize = 50 } = payload;
    
    // 1. Fetch Job and Lock it
    const { data: job, error: jobError } = await supabase
      .from('generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Job ${jobId} not found or failed to fetch: ${jobError?.message}`);
    }

    if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
      return { success: true, message: `Job ${jobId} already ${job.status}` };
    }

    // Update Status to RUNNING
    await supabase.from('generation_jobs').update({ status: 'RUNNING' }).eq('id', jobId);

    // Logging helper
    const logEvent = async (event: string, message: string, metadata: any = {}, questionId: string | null = null) => {
      await supabase.from('generation_logs').insert({
        job_id: jobId,
        event,
        message,
        metadata,
        question_id: questionId
      });
      console.log(`[Job ${jobId}] [${event}] ${message}`);
    };

    await logEvent('Job Started', `Resuming/Starting generation job with chunk size ${chunkSize}`);

    try {
      const totalRequested = job.total_requested;
      let totalGenerated = job.total_generated || 0;
      let failedCount = job.failed_questions || 0;

      while (totalGenerated < totalRequested) {
        // Fetch current job status to allow pausing/cancelling mid-run
        const { data: currentJob } = await supabase.from('generation_jobs').select('status').eq('id', jobId).single();
        if (currentJob?.status === 'PAUSED') {
          await logEvent('Job Paused', 'Job was paused by administrator.');
          return { status: 'PAUSED' };
        }
        if (currentJob?.status === 'CANCELLED') {
          await logEvent('Job Cancelled', 'Job was cancelled by administrator.');
          return { status: 'CANCELLED' };
        }

        const remaining = totalRequested - totalGenerated;
        const currentChunkSize = Math.min(chunkSize, remaining);
        
        await logEvent('Chunk Started', `Starting chunk of ${currentChunkSize} questions`);

        // --- BATCH GENERATION LOGIC GOES HERE ---
        // For each item in chunk:
        // 1. Pick Template
        // 2. Randomize Parameters
        // 3. Symbolic Math Solver
        // 4. Generator AI
        // 5. Validator AI
        // 6. DB Insertion & Embeddings (Duplicate checks)

        // Mock simulation of chunk processing for now
        let chunkGenerated = 0;
        let chunkFailed = 0;

        for (let i = 0; i < currentChunkSize; i++) {
            // Mock individual question generation
            // Wrap in try-catch to implement requirement: 
            // "Never terminate an entire generation job because of one failed question."
            try {
                // TODO: Actual generation pipeline insertion
                chunkGenerated++;
            } catch (err) {
                chunkFailed++;
                await logEvent('Validation Failed', `Question ${i} failed generation/validation`, { error: String(err) });
            }
        }

        totalGenerated += chunkGenerated;
        failedCount += chunkFailed;

        const progress = (totalGenerated / totalRequested) * 100;

        // Update Job state after chunk
        await supabase.from('generation_jobs').update({
            total_generated: totalGenerated,
            failed_questions: failedCount,
            progress: progress,
            // Mock cost tracking
            estimated_cost: (totalGenerated * 0.0012).toFixed(4), 
            actual_cost: (totalGenerated * 0.0012).toFixed(4),
            cost_per_question: 0.0012
        }).eq('id', jobId);

        await logEvent('Chunk Completed', `Chunk finished. Total Generated: ${totalGenerated}/${totalRequested}`);
      }

      await supabase.from('generation_jobs').update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          progress: 100.0
      }).eq('id', jobId);

      await logEvent('Job Completed', `Generation job finished successfully.`);

      return { success: true, generated: totalGenerated, failed: failedCount };
    } catch (error) {
      // Unhandled global error
      await supabase.from('generation_jobs').update({ status: 'FAILED' }).eq('id', jobId);
      await logEvent('Job Failed', `Critical error in generation loop: ${String(error)}`);
      throw error; // Trigger.dev will catch and retry if attempts < maxAttempts
    }
  },
});
